#  **How To Install Free SSL Certificate Using  Let’s Encrypt, APACHE  and Reverse Proxy on Linux** 
  
##  pre-requisites
  
`Apache installed ,enabled and started.  
In order to configure SSL, you will need to ensure that the Apache mod_ssl module is installed on the server.`
>sudo yum install mod_ssl
  
##  Step 1: Add A Records on  your  Cpanel for your domain EG
---------------
```
for domain site.mydomain.com

create two a records for site.mydomain.com and www.site.mydomain.com

```
  
##  Step 2:   Generating Certificate file from Letsencrypt
---------------

### 2.1 Install certbot tool
```
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install certbot

# Fedora
sudo dnf install certbot python2-certbot-apache

# CentOS 8
sudo dnf -y install epel-release
sudo dnf -y install certbot

# CentOS 7
sudo yum -y install epel-release
sudo yum -y install certbot
```

### 2.2 Stop Apache Server according to your Linux Release.

### 2.3 Generate Certificate from Letsencrypt.
`pre-requisite: Test your domain name dns record if they are pointing to your  public ip address. You can user the following site. EG https://dnschecker.org/`

>sudo certbot certonly -d  site.mydomain.com -d www.site.mydomain.com

As you make first request, the script will install required packages/dependencies and setup virtual environment. Initially you can choose to spin up a a temporary webserver (standalone) for domain verification.

`The generated file will be found  in /etc/letsencrypt/live/site.mydomain.com/. The Location Varies according to your domain name`
  
``Note the above location since we are going to use them in the next step``
  
##   Step 3:   SSL and Reverse Proxy Configuration
---------------
  
Edit the virtual host entry available in `/etc/httpd/conf.d/ssl.conf` file to assign the Private Key, Certificate and the Intermediate CA file to the configuration.
`The Above location is variant across different Linux Distributions. The above location is for RHEL-based Distro`
  
###   3.1 Setting Server Name  (Optional)
  
  
inside the following tag `<VirtualHost _default_:443>`
 >set server name e.g for domain` site.mydomain.com` would be
`ServerName site.mydomain.com`
  
###  3.2 Setting path to  Server Certificate , Server Private Key and  Server Certificate Chain files.
  
  
Find the tags and edit the corresponding correct path E.G
  
>For Server Certificate 
`/etc/letsencrypt/live/site.mydomain.com/cert.pem`
  
> For Server Private Key 
`/etc/letsencrypt/live/site.mydomain.com/privkey.pem`
  
> For Server Certificate Chain:
`/etc/letsencrypt/live/site.mydomain.com/fullchain.pem`
  
**NB**
The Above File naming pattern can be different.
  
###  3.3 Set up The Reverse Proxy
  
  
>Just before the` </VirtualHost>` tag
add the following lines
``` xml
<Proxy *>
	Order deny,allow
        Allow from all
   </Proxy>
  
   ProxyRequests Off
   ProxyPreserveHost On
   ProxyPass / http://localhost:8081/
   ProxyPassReverse / http://localhost:8081/
```
Where by http://localhost:8081/ is the URL to your application.
  
  
### Finally restart Apache  and enjoy
---------------
  :blush:

----
created-by: Simon Kimathi
----
  