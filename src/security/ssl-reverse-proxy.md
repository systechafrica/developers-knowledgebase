# **SSL Installation Using APACHE and Reverse Proxy on Linux** 
## pre-requisites
`Apache installed ,enabled and started.  
In order to configure SSL, you will need to ensure that the Apache mod_ssl module is installed on the server.`
>sudo yum install mod_ssl

## Step 1: Generating Key and CSR
---------------

### METHOD A:
### Generate Keystore 

 > sudo keytool -genkey -alias {ALIAS_NAME} -keyalg RSA -validity 3650 -keysize 2048 -keystore {KEYSTORE} 

```

NB: the keystore can have .keystore or .jks  or .key extension

```

```
PS: dont forget the {KEYSTORE_PASSWORD} you will set

NB : private key alias === {ALIAS_NAME} most preferebly domain name  as well as the first name, last name

You will use it for CSR creation and certificate installation. Make sure you remember it. 

```

###  Generating csr 
> keytool -certreq -keyalg RSA -alias {ALIAS_NAME} -file {ALIAS_NAME}.csr -keystore {KEYSTORE}


**NB: There are multiple ways to generate Private key and CSR for SSL certificate**

# Method B:
```
sudo openssl req -new -newkey rsa:2048 -nodes -keyout mss.systechafrica.com.key -out mss.systechafrica.com.csr
```
- [x] you will be asked to enter following details
- [ ] Country Name – This is the two-letter abbreviation for your country. For example, United States would be US and Great Britain would be GB. 
- [ ] State or Province Name – This is the full name of the state your organization operates from. For example, this might be “California” or “Michigan”.
- [ ] Locality Name – Name of the city your organization operates from. Examples might include “Lansing” or “Phoenix”. Don’t use abbreviations in this field. For example, “St. Helena” should be “Saint Helena”.
- [ ] Organization Name – The name of your organization. If you are a business, use must use your legal name. If you are applying as an individual, you use your full name instead.
- [ ] Organizational Unit Name – If applying as a business, you can enter your “Doing Business As” (DBA) name here. Alternately, you can use a department name here. For example, “IT Department” or “Web Administration”.
- [ ] Common Name – The domain name that you are purchasing a SSL certificate for. This must be a fully qualified domain name (FQDN). An example might be mydomain.com.
Note:
If you are applying for a special wildcard SSL certificate, you will need to enter an asterisk for the subdomain. An example in that case might be *.mydomain.com. Never include the “http://”, “https://”, or any other special characters in this field. Never include text after the top level domain at the end. For example, your common name should end in .com, .net, (or whatever other extension you are applying for.)
- [ ] Email Address – An email address that can be used as a point of contact for your domain. Be sure the address is valid!
- [ ] A challenge password – An optional password to further secure your certificate. Be sure to remember this password if you choose to use it. It must be at least 4 characters long. You can skip this step if you like.
- [ ] An optional company name – Another optional step. Fill in your company name if you wish. This is not required for web SSL certificates.

## Step 2: Ordering Certificate
---------------

>Open your CSR file (.csr) with any text editor such as Notepad, and copy-paste all its contents into your SSL certificate order page. 
Depending on the type of your cert, you may have to wait a few minutes (DV certs) or a couple of business days (EV and BV certs) for it to arrive in your email inbox. 

##  Step 3:   Coping certificate and key files to your Linux Server
---------------

`These files can be placed anywhere, but it is recommended to have them in the following location.`
- [x] Server Certificate and Intermediate - **/etc/pki/tls/certs/**
- [x] Private Key - **/etc/pki/tls/private/**

Run the following command if you face errors on SELinux to to restore the default context of a files.

`sudo restorecon -RvF /etc/ssl/certs/`
`sudo setsebool -P httpd_read_user_content 1`

``Note the above locations since we are going to use them in the next step``

##  Step 4:   SSL and Reverse Proxy Configuration
---------------
Edit the virtual host entry available in /etc/httpd/conf.d/ssl.conf file to assign the Private Key, Certificate and the Intermediate CA file to the configuration.
`The Above location is variant across different Linux Distributions. The above location is for RHEL-based Distro`

###  4.1 Setting Server Name

inside the following tag `<VirtualHost _default_:443>`
 >set server name e.g for domain` mss.systechafrica.com` would be
`ServerName mss.systechafrica.com`

### 4.2 Setting path to  Server Certificate , Server Private Key and  Server Certificate Chain files.

Find the tags and edit the corresponding correct path E.G

>For Server Certificate 
`SSLCertificateFile /etc/pki/tls/certs/mss_systechafrica_com.crt`

> For Server Private Key 
`SSLCertificateKeyFile /etc/pki/tls/private/mss_systechafrica_com.key`

> For Server Certificate Chain:
`SSLCertificateChainFile /etc/pki/tls/certs/mss_systechafrica_com.ca-bundle`

**NB**
The Above File naming pattern can be different.

### 4.3 Set up The Reverse Proxy

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

Run the following command if you face errors on SELinux preventing Apache from initiating outbound connection
`sudo /usr/sbin/setsebool -P httpd_can_network_connect 1`

To Test Your configurations Use
`sudo httpd -S`

To check for ssl error logs use
`sudo tail -f /etc/httpd/logs/ssl_error_log`

To check for ssl access logs use
`sudo tail -f /etc/httpd/logs/ssl_access_log`


  # Finally restart Apache  and enjoy
  :blush:
