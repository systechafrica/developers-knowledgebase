# GIT Backup

To automate git backup from the cloud to the on-premise server, follow the following steps.
Create a bash script that you can run manually to backup git to the hosting server using the following bash commands:

````bash
sudo bash <<EOF
# Run GitLab backup command
if $GITLAB_DIR/bin/gitlab-rake gitlab:backup:create; then
    echo "GitLab backup completed successfully."

    # Delete previous backups, retaining only the latest 2
    ls -1t /var/opt/gitlab/backups | tail -n +3 | xargs -I {} sudo rm /var/opt/gitlab/backups/{}

    # Remove all previous backups in $BACKUP_DIR
    rm -f "$BACKUP_DIR"/*.tar
    rm -f "$BACKUP_DIR"/gitlab-*
    rm -f "$BACKUP_DIR"/gitlab.*

    # Copy the backup archive to $BACKUP_DIR with timestamp
    sudo cp /var/opt/gitlab/backups/*.tar "$BACKUP_DIR/"

    # Adjust permissions for the copied backup files
    sudo chmod 644 "$BACKUP_DIR"/*.tar

    # Copy gitlab.rb with timestamp to $BACKUP_DIR
    sudo cp /etc/gitlab/gitlab.rb "$BACKUP_DIR/gitlab.rb_$TIMESTAMP"

    # Adjust permissions for the copied gitlab.rb file
    sudo chmod 644 "$BACKUP_DIR/gitlab.rb_"*

    # Copy gitlab-secrets.json with timestamp to $BACKUP_DIR
    sudo cp /etc/gitlab/gitlab-secrets.json "$BACKUP_DIR/gitlab-secrets.json_$TIMESTAMP"

    # Adjust permissions for the copied gitlab-secrets.json file
    sudo chmod 600 "$BACKUP_DIR/gitlab-secrets."*

    echo "Backup archive and files, along with the latest 2 backups, copied to $BACKUP_DIR"
else
    echo "GitLab backup failed. Check logs for more details."
fi
EOF
````

This script will backup the git tar file plus all the necessary configurations required during the restoring process, that is gitlab secrets & gitlab.rb files.

## Backing git to the local server
Generate ssh-key in the destination server using the command: ssh-keygen -t rsa.
Input the password of your choice or leave it blank and confirm.
Input the paraphrase of your choice or leave it blank and confirm.
Run: ssh-copy-id user@gitlab_host
Test connection: ssh user@gitlab_host