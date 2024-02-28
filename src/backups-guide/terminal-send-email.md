# Sending an Email with Attachment In a Linux Bash
In this tutorial, we'll learn how to send an email with an optional attachment using both Python and Bash scripts.

This is applicable on Automated backup script to send a notification after sending backup process is complete

## pre-requisite
You must have python 3 Installed and a working SMTP credentials

## Python Script Explanation

The Python script utilizes the `smtplib` library to send emails via SMTP. Here's a breakdown of the Python script:

`File Name: send_email.py`

```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

def send_email_with_attachment(recipient, subject, body, attachment_path=None):
    sender = 'your_email@example.com'
    smtp_server = 'smtp.example.com'
    smtp_port = 587
    smtp_username = 'your_smtp_username'
    smtp_password = 'your_smtp_password'

    msg = MIMEMultipart()
    msg['From'] = sender
    msg['To'] = recipient
    msg['Subject'] = subject

    # Attach body
    msg.attach(MIMEText(body, 'plain'))

    #  Attach file if provided
    if attachment_path:
        with open(attachment_path, 'rb') as attachment:
            part = MIMEBase('application', 'octet-stream')
            part.set_payload(attachment.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename= {attachment_path}')
        msg.attach(part)

    try:
        smtp = smtplib.SMTP(smtp_server, smtp_port)
        smtp.starttls()
        smtp.login(smtp_username, smtp_password)
        smtp.sendmail(sender, recipient, msg.as_string())
        smtp.quit()
        print("Email sent successfully to", recipient)
    except Exception as e:
        print("Failed to send email:", e)

# Email parameters
recipient = 'smnkimathi@gmail.com' #set the recipient email
subject = 'Gitlab Migration Backup'
body = 'This Gitlab backup has been successfully completed. Please find attached backup file. This is a test email with test attachment.'
attachment_path = '/home/symoh/test.zip'  # Replace with the path to your document, or leave as None(I.E attachment_path = None )

# Send the email with attachment
send_email_with_attachment(recipient, subject, body, attachment_path)
```
## Bash Script Explanation

The Bash script handles email sending using the python script above

`File Name: send_email.sh`
```bash
#!/bin/bash

# Function to send email using Python script
send_email_python() {
    python3 send_email.py
}

# Main
main() {
    # Call Python script to send email
    send_email_python
}

# Call main function
main
```
> Ensure both scripts (send_email.sh and send_email.py) are in the same directory. The Bash script (send_email.sh) calls the Python script (send_email.py) to send the email. You may need to adjust the file paths if they are in different directories.
>> You can attach this script on your backup script or create a cron job for it
