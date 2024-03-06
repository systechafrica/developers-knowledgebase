# AUTOMATED BACKUPS

## Databases
````
  	Remove password login between the two servers involved in the backup process.
	Generate ssh-key in the destination server using the command: ssh-keygen -t rsa.
	Input the password of your choice or leave it blank and confirm.
	Input the paraphrase of your choice or leave it blank and confirm.
	Run: ssh-copy-id user@remote_host
	Test connection: ssh user@remote_host
	Create a bash script to run the backup using the following bash commands provided for both oracle and postgres
````