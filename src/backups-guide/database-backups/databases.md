## Databases


### Prerequisites
````
  	Remove password login between the two servers involved in the backup process.
	Generate ssh-key in the destination server using the command: ssh-keygen -t rsa.
	Input the password of your choice or leave it blank and confirm.
	Input the paraphrase of your choice or leave it blank and confirm.
	Run: ssh-copy-id user@remote_host
	Test connection: ssh user@remote_host
	Create a bash script to run the backup using the following bash commands provided for both oracle and postgres
````

### Oracle
~~~bash
ORACLE_USER=<your-oracle-user>
ORACLE_PASSWORD=<your-oracle-password>
DATE=$(date +'%d%m%Y_%H%M')  # Fixing the date format
FILENAME=qadb_${DATE}.dmp
DB_NAME=qadb
DEST_IP=<destinamtion-server-ip>

# Corrected the expdp command and added error handling
$ORACLE_HOME/bin/expdp ${ORACLE_USER}/${ORACLE_PASSWORD}@localhost/${DB_NAME} \
  full=y directory=PLUGGABLE_DATA_PUMP_DIR \
  dumpfile=${FILENAME} && \

echo "Finished database backup" && \

# Check if the dump file exists before attempting to zip and remove it
if [ -f "${EXPORT_FOLDER}/${FILENAME}" ]; then
  cd "${EXPORT_FOLDER}" && \
  zip "${EXPORT_DIRECTORY}/${FILENAME}.zip" "${FILENAME}" && \
  rm "${FILENAME}" && \
  echo "Dump file zipped and removed successfully"
else
  echo "Error: Dump file not found at ${EXPORT_FOLDER}/${FILENAME}"
fi && \

#rm ${EXPORT_DIRECTORY}/${FILENAME} && \

# Added quotes around the echo command
scp ${EXPORT_DIRECTORY}/${FILENAME}.zip systech1@${DEST_IP}:~/db_backup/oracle/qadb/
~~~

### Postgres
````bash
db_name=<db_name>
db_password=<db_password>
db_port=5433
backupfolder=/home/systech3/db_backup
sqlfile=$backupfolder/nassit$(date +%Y%m%d-%H-%M-%S).sql

export PGPASSWORD="$db_password"

# List all backup files and sort them by modification time
backup_files=($backupfolder/nassit*.sql)
IFS=$'\n' backup_files=($(sort <<<"${backup_files[*]}"))

# Keep only the latest backup and delete the rest
if [[ ${#backup_files[@]} -gt 1 ]]; then
    for ((i = 0; i < ${#backup_files[@]} - 1; i++)); do
        rm "${backup_files[$i]}"
    done
fi
# Perform the database backup
if pg_dump -U postgres -d $db_name > $sqlfile -p $db_port; then
    unset PGPASSWORD
    echo 'Sql dump created'
else
    echo 'pg_dump returned a non-zero code'
    exit 1
fi
````





