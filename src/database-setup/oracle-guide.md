# Oracle Database Setup
------------------------

# Windows
---------------

```sql
create PLUGGABLE DATABASE demo ADMIN USER PDB\_ADMIN IDENTIFIED BY oracle FILE\_NAME\_CONVERT \= ('C:\\oracle\\app\\193c\\oradata\\PROD1\\pdbseed\\','C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\demo');

alter session set container=demo;

startup;

CREATE OR REPLACE DIRECTORY PLUGGABLE\_DATA\_PUMP\_DIR as 'C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\';

GRANT READ, WRITE ON DIRECTORY PLUGGABLE\_DATA\_PUMP\_DIR TO SYSTEM;

create tablespace FUND\_TABLESPACE datafile 'C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\FUND\_TABLESPACE.DBF' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create temporary tablespace TEMP\_FUND\_TABLESPACE tempfile 'C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\TEMP\_FUND\_TABLESPACE' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create tablespace USERS datafile 'C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\USERS.DMP' SIZE 526m AUTOEXTEND ON NEXT 200M;

create user fm identified by O\_install#4 default tablespace FUND\_TABLESPACE TEMPORARY tablespace TEMP\_FUND\_TABLESPACE QUOTA UNLIMITED ON FUND\_TABLESPACE;

Grant dba to fm;

```

\-- Before the next command ensure you have copied the dump file to the demo directory---  
```sql
impdp fm/O\_install#4@demo dumpfile=demo.dmp  metrics=y transport\_datafiles='C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\FUND\_TABLESPACE.DBF', 'C:\\oracle\\app\\193c\\oradata\\PROD1\\demo\\demo.dmp' version=19.3.0 schemas=fm directory=PLUGGABLE\_DATA\_PUMP\_DIR
```

## Linux
---------------

```sql
create PLUGGABLE DATABASE demo  ADMIN USER PDB\_ADMIN IDENTIFIED BY oracle FILE\_NAME\_CONVERT \= ('/u01/app/oracle/oradata/ORCL/pdbseed','/u01/app/oracle/oradata/ORCL/demo');

alter session set container\=demo;

startup;

CREATE OR REPLACE DIRECTORY PLUGGABLE\_DATA\_PUMP\_DIR as '/u01/app/oracle/oradata/ORCL/demo';

GRANT READ, WRITE ON DIRECTORY PLUGGABLE\_DATA\_PUMP\_DIR TO SYSTEM;

create tablespace FUND\_TABLESPACE datafile '/u01/app/oracle/oradata/ORCL/demo/FUND\_TABLESPACE.DBF' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create temporary tablespace TEMP\_FUND\_TABLESPACE tempfile '/u01/app/oracle/oradata/ORCL/demo/TEMP\_FUND\_TABLESPACE' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create tablespace USERS datafile '/u01/app/oracle/oradata/ORCL/demo/USERS.DMP' SIZE 526m AUTOEXTEND ON NEXT 200M;
\-- replace #password with your password
create user fm identified by #password default tablespace FUND\_TABLESPACE TEMPORARY tablespace TEMP\_FUND\_TABLESPACE QUOTA UNLIMITED ON FUND\_TABLESPACE;

Grant dba to fm;
```

\-- Before the next command ensure you have copied the dump file to the demo directory---  
\-- replace #password with your password
```sql
!impdp fm/#password@demo dumpfile=demo.dmp  metrics=y transport\_datafiles='/u01/app/oracle/oradata/ORCL/demo/FUND\_TABLESPACE.DBF', 'demo.dmp' version=19 schemas=fm directory=PLUGGABLE\_DATA\_PUMP\_DIR
```

*   For `linux` and `windows` start the listener using the command:

        lsnrctl start

# Important Commands

## Starting database

- [x] `sqlplus sys as sysdba`
- [x] `startup;`
- [x] `alter pluugable database demo open;`

## Starting database (Using Bash Script)
- Create a file with the extentions .sh
- configure the files in references to your dump file
```bash 
#!/bin/bash

export PLUGGABLE_NAME=
export ALL_PLUGGABLES=
read -p 'Do You want to start all the pluggables: type "y/yes"   ' ALL_PLUGGABLES
ALL_PLUGGABLES=${ALL_PLUGGABLES:-y}

if [ "$ALL_PLUGGABLES" == "n" ] || [ "$ALL_PLUGGABLES" == "No" ]|| [ "$ALL_PLUGGABLES" == "no" ]|| [ "$ALL_PLUGGABLES" == "NO" ]; then
    read -p 'Type the name of the Pluggable you want to start: ' PLUGGABLE_NAME
    PLUGGABLE_NAME=${PLUGGABLE_NAME}
fi

echo "************************* switching user oracle *************************" 

sudo su - oracle <<EOF
# The rest of your script goes here
# ...

echo "************************* starting listener *************************" 

lsnrctl start

echo "************************* Starting Oracle *************************" 

# Step 4: Creating Pluggables
sqlplus / as sysdba <<SQL
 startup;
SQL

if [ "$ALL_PLUGGABLES" == "n" ] || [ "$ALL_PLUGGABLES" == "No" ]; then
    # Step 3: Creating Pluggables
sqlplus / as sysdba <<SQL
 alter session set container="$PLUGGABLE_NAME";
SQL

else 

 # Step 3: starting pluggable
sqlplus / as sysdba <<SQL
 alter pluggable database all open;
SQL

fi


EOF


```

## starting the listener services

- [x] `lsnrctl start`

## Stopping listerner services

- [x] `lsnrctl stop`

## Refreshing  listerner services

- [x] `lsnrctl reload`

## Droping pluggable database

- [x] `alter pluggable database dbname close;`

- [x] `drop pluggable database dbname including datafiles;`

## Creating pluggable database

- This two paths are dependent on the location of `oradata` directory
  `'/opt/oracle/oradata/ORCLCDB/pdbseed/'`,
  `'/opt/oracle/oradata/ORCLCDB/demo/`
  so replace them in the sql below to the paths of your machine

```sql
create PLUGGABLE DATABASE demo ADMIN USER PDB_ADMIN IDENTIFIED BY oracle FILE_NAME_CONVERT = ('/opt/oracle/oradata/ORCLCDB/pdbseed/','/opt/oracle/oradata/ORCLCDB/demo/');

alter session set container=demo;

startup;

CREATE OR REPLACE DIRECTORY PLUGGABLE_DATA_PUMP_DIR as '/opt/oracle/oradata/ORCLCDB/demo/';

GRANT READ, WRITE ON DIRECTORY PLUGGABLE_DATA_PUMP_DIR TO SYSTEM;

create tablespace FUND_TABLESPACE datafile '/opt/oracle/oradata/ORCLCDB/demo/FUND_TABLESPACE.DBF' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create temporary tablespace TEMP_FUND_TABLESPACE tempfile '/opt/oracle/oradata/ORCLCDB/demo/TEMP_FUND_TABLESPACE' SIZE 1012m AUTOEXTEND ON NEXT 200M;

create tablespace USERS datafile '/opt/oracle/oradata/ORCLCDB/demo/USERS.DMP' SIZE 526m AUTOEXTEND ON NEXT 200M;

create user fm identified by fm1232020 default tablespace FUND_TABLESPACE TEMPORARY tablespace TEMP_FUND_TABLESPACE QUOTA UNLIMITED ON FUND_TABLESPACE;

Grant dba to fm;
```

## Add TNSNAME for our pluggable

- [x] `vi path/to/tnsname.ora` e.g `/u01/app/oracle/product/19.3/dbhome_1/network/admin/tnsnames.ora`
- [x] Insert the following at the end of the file
  `DEMO =
  (DESCRIPTION =
  (ADDRESS = (PROTOCOL = TCP)(HOST = 0.0.0.0)(PORT = 1522))
  (CONNECT_DATA =
  (SERVER = DEDICATED)
  (SERVICE_NAME = demo)
  )
  )`
- [x] Reload the listener to register the service name
  `lsnrctl reload`
- [x] Check status of services
  `lsnrctl services`

## Import pluggable database

- [x] Before the next command ensure you have copied the dump file to the `demo` directory---

- [x] -- oustside sqlplus
  `impdp fm/fm1232020@demo dumpfile=demo.dmp  metrics=y transport_datafiles='/opt/oracle/oradata/ORCLCDB/demo/FUND_TABLESPACE.DBF', '/opt/oracle/oradata/ORCLCDB/demo.dmp' version=19.3.0 schemas=fm directory='PLUGGABLE_DATA_PUMP_DIR'`

- [x] -- inside sqlplus

    ```sql
    !impdp fm/fm1232020@demo dumpfile=demo.dmp  metrics=y transport_datafiles='/opt/oracle/oradata/ORCLCDB/demo/FUND_TABLESPACE.DBF', '/opt/oracle/oradata/ORCLCDB/demo.dmp' version=19.3.0 schemas=fm directory=PLUGGABLE_DATA_PUMP_DIR
    ```
- [x] Exporting Database from Oracle
  ```console
  expdp fm/password@dbname dumpfile=dumpfilename.dmp version=19 schemas=fm directory=PLUGGABLE_DATA_PUMP_DIR
  ```
  ## Import pluggable database (Using Bash Script)
- Create a file with the extentions .sh
- configure the files in references to your dump file 
```bash
#!/bin/bash

# Set Oracle environment variables for the first user
export ORACLE_SID="dump_database"
export ORACLE_USERNAME="sys"

# Set PDB and dump file information
export EXISTING_PDB_NAME="dump_database"
export NEW_PDB_NAME="dump_database"
export FOLDER_NAME="dump_database"
export DUMP_NAME="dump_database.dmp"
export PDB_ADMIN_USER="oracle_user"
export PDB_ADMIN_PASSWORD="user_password"
export DUMP_FILE_PATH="/home/user/Documents/database_tools/oracle_dumps/dump_database.dmp"
export PLUGGABLE_ORCL="/u01/app/oracle/oradata/ORCL"

echo "************************* copying dump to oracle *************************"

cp "$DUMP_FILE_PATH" "$PLUGGABLE_ORCL"/"$FOLDER_NAME"

echo "************************* switching user oracle *************************"
# Switch to the oracle user
sudo su - oracle <<EOF

echo "************************* Updating Permissions & Ownership **************************"
sudo chown -R oracle:oinstall "$PLUGGABLE_ORCL"/"$FOLDER_NAME"/"$DUMP_NAME"
sudo chmod +x  "$PLUGGABLE_ORCL"/"$FOLDER_NAME"/"$DUMP_NAME"

echo "************************* Importing New Dump **************************"

impdp "$PDB_ADMIN_USER"/"$PDB_ADMIN_PASSWORD"@localhost:1522/"$NEW_PDB_NAME" dumpfile="$DUMP_NAME" metrics=y transport_datafiles='$PLUGGABLE_ORCL/$FOLDER_NAME/FUND_TABLESPACE.DBF', '$PLUGGABLE_ORCL/$FOLDER_NAME/FUND_TABLESPACE.DBF' version=19.3.0 schemas=fm directory=PLUGGABLE_DATA_PUMP_DIR

EOF

```