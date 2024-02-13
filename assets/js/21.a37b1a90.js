(window.webpackJsonp=window.webpackJsonp||[]).push([[21],{303:function(e,t,a){"use strict";a.r(t);var r=a(14),s=Object(r.a)({},(function(){var e=this,t=e._self._c;return t("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[t("h1",{attrs:{id:"how-to-install-free-ssl-certificate-using-let-s-encrypt-apache-and-reverse-proxy-on-linux"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#how-to-install-free-ssl-certificate-using-let-s-encrypt-apache-and-reverse-proxy-on-linux"}},[e._v("#")]),e._v(" "),t("strong",[e._v("How To Install Free SSL Certificate Using  Let’s Encrypt, APACHE  and Reverse Proxy on Linux")])]),e._v(" "),t("h2",{attrs:{id:"pre-requisites"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#pre-requisites"}},[e._v("#")]),e._v(" pre-requisites")]),e._v(" "),t("p",[t("code",[e._v("Apache installed ,enabled and started. In order to configure SSL, you will need to ensure that the Apache mod_ssl module is installed on the server.")])]),e._v(" "),t("blockquote",[t("p",[e._v("sudo yum install mod_ssl")])]),e._v(" "),t("h2",{attrs:{id:"step-1-add-a-records-on-your-cpanel-for-your-domain-eg"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#step-1-add-a-records-on-your-cpanel-for-your-domain-eg"}},[e._v("#")]),e._v(" Step 1: Add A Records on  your  Cpanel for your domain EG")]),e._v(" "),t("hr"),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("for domain site.mydomain.com\n\ncreate two a records for site.mydomain.com and www.site.mydomain.com\n\n")])])]),t("h2",{attrs:{id:"step-2-generating-certificate-file-from-letsencrypt"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#step-2-generating-certificate-file-from-letsencrypt"}},[e._v("#")]),e._v(" Step 2:   Generating Certificate file from Letsencrypt")]),e._v(" "),t("hr"),e._v(" "),t("h3",{attrs:{id:"_2-1-install-certbot-tool"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2-1-install-certbot-tool"}},[e._v("#")]),e._v(" 2.1 Install certbot tool")]),e._v(" "),t("div",{staticClass:"language- extra-class"},[t("pre",{pre:!0,attrs:{class:"language-text"}},[t("code",[e._v("# Ubuntu / Debian\nsudo apt-get update\nsudo apt-get install certbot\n\n# Fedora\nsudo dnf install certbot python2-certbot-apache\n\n# CentOS 8\nsudo dnf -y install epel-release\nsudo dnf -y install certbot\n\n# CentOS 7\nsudo yum -y install epel-release\nsudo yum -y install certbot\n")])])]),t("h3",{attrs:{id:"_2-2-stop-apache-server-according-to-your-linux-release"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2-2-stop-apache-server-according-to-your-linux-release"}},[e._v("#")]),e._v(" 2.2 Stop Apache Server according to your Linux Release.")]),e._v(" "),t("h3",{attrs:{id:"_2-3-generate-certificate-from-letsencrypt"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_2-3-generate-certificate-from-letsencrypt"}},[e._v("#")]),e._v(" 2.3 Generate Certificate from Letsencrypt.")]),e._v(" "),t("p",[t("code",[e._v("pre-requisite: Test your domain name dns record if they are pointing to your public ip address. You can user the following site. EG https://dnschecker.org/")])]),e._v(" "),t("blockquote",[t("p",[e._v("sudo certbot certonly -d  site.mydomain.com -d www.site.mydomain.com")])]),e._v(" "),t("p",[e._v("As you make first request, the script will install required packages/dependencies and setup virtual environment. Initially you can choose to spin up a a temporary webserver (standalone) for domain verification.")]),e._v(" "),t("p",[t("code",[e._v("The generated file will be found in /etc/letsencrypt/live/site.mydomain.com/. The Location Varies according to your domain name")])]),e._v(" "),t("p",[t("code",[e._v("Note the above location since we are going to use them in the next step")])]),e._v(" "),t("h2",{attrs:{id:"step-3-ssl-and-reverse-proxy-configuration"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#step-3-ssl-and-reverse-proxy-configuration"}},[e._v("#")]),e._v(" Step 3:   SSL and Reverse Proxy Configuration")]),e._v(" "),t("hr"),e._v(" "),t("p",[e._v("Edit the virtual host entry available in "),t("code",[e._v("/etc/httpd/conf.d/ssl.conf")]),e._v(" file to assign the Private Key, Certificate and the Intermediate CA file to the configuration.\n"),t("code",[e._v("The Above location is variant across different Linux Distributions. The above location is for RHEL-based Distro")])]),e._v(" "),t("h3",{attrs:{id:"_3-1-setting-server-name-optional"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3-1-setting-server-name-optional"}},[e._v("#")]),e._v(" 3.1 Setting Server Name  (Optional)")]),e._v(" "),t("p",[e._v("inside the following tag "),t("code",[e._v("<VirtualHost _default_:443>")])]),e._v(" "),t("blockquote",[t("p",[e._v("set server name e.g for domain"),t("code",[e._v("site.mydomain.com")]),e._v(" would be\n"),t("code",[e._v("ServerName site.mydomain.com")])])]),e._v(" "),t("h3",{attrs:{id:"_3-2-setting-path-to-server-certificate-server-private-key-and-server-certificate-chain-files"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3-2-setting-path-to-server-certificate-server-private-key-and-server-certificate-chain-files"}},[e._v("#")]),e._v(" 3.2 Setting path to  Server Certificate , Server Private Key and  Server Certificate Chain files.")]),e._v(" "),t("p",[e._v("Find the tags and edit the corresponding correct path E.G")]),e._v(" "),t("blockquote",[t("p",[e._v("For Server Certificate\n"),t("code",[e._v("/etc/letsencrypt/live/site.mydomain.com/cert.pem")])])]),e._v(" "),t("blockquote",[t("p",[e._v("For Server Private Key\n"),t("code",[e._v("/etc/letsencrypt/live/site.mydomain.com/privkey.pem")])])]),e._v(" "),t("blockquote",[t("p",[e._v("For Server Certificate Chain:\n"),t("code",[e._v("/etc/letsencrypt/live/site.mydomain.com/fullchain.pem")])])]),e._v(" "),t("p",[t("strong",[e._v("NB")]),e._v("\nThe Above File naming pattern can be different.")]),e._v(" "),t("h3",{attrs:{id:"_3-3-set-up-the-reverse-proxy"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#_3-3-set-up-the-reverse-proxy"}},[e._v("#")]),e._v(" 3.3 Set up The Reverse Proxy")]),e._v(" "),t("blockquote",[t("p",[e._v("Just before the"),t("code",[e._v("</VirtualHost>")]),e._v(" tag\nadd the following lines")])]),e._v(" "),t("div",{staticClass:"language-xml extra-class"},[t("pre",{pre:!0,attrs:{class:"language-xml"}},[t("code",[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("<")]),e._v("Proxy")]),e._v(" "),t("span",{pre:!0,attrs:{class:"token attr-name"}},[e._v("*")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(">")])]),e._v("\n\tOrder deny,allow\n        Allow from all\n   "),t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token tag"}},[t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v("</")]),e._v("Proxy")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[e._v(">")])]),e._v("\n  \n   ProxyRequests Off\n   ProxyPreserveHost On\n   ProxyPass / http://localhost:8081/\n   ProxyPassReverse / http://localhost:8081/\n")])])]),t("p",[e._v("Where by http://localhost:8081/ is the URL to your application.")]),e._v(" "),t("h3",{attrs:{id:"finally-restart-apache-and-enjoy"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#finally-restart-apache-and-enjoy"}},[e._v("#")]),e._v(" Finally restart Apache  and enjoy")]),e._v(" "),t("hr"),e._v(" "),t("p",[e._v("😊")]),e._v(" "),t("hr"),e._v(" "),t("h2",{attrs:{id:"created-by-simon-kimathi"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#created-by-simon-kimathi"}},[e._v("#")]),e._v(" created-by: Simon Kimathi")])])}),[],!1,null,null,null);t.default=s.exports}}]);