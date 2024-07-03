# ORACLE - POSTGRES MIGRATION

## Target

````
To have Fundmaster XE run on PostgreSQL Database 
````

## Why

````
    1.Cost: Oracle license costs, using Oracle databases incurs additional costs for features like partitioning and high availability, and expenses can add up quickly. Open-source PostgreSQL is free to install and use.
    2.Flexibility: PostgreSQL has open-source licensing and is easily available from public cloud providers, including AWS. With PostgreSQL, you’re not at risk of vendor lock-in.
    3.Customizability: Because PostgreSQL is open-source, there are countless extensions and add-ons that can improve database performance markedly, and many of them are free to use. With Oracle, similar features quickly add up in cost.
  SOURCE: https://www.enterprisedb.com/blog/the-complete-oracle-to-postgresql-migration-guide-tutorial-move-convert-database-oracle-alternative
````

#### Do we need Oracle database to Postgres database migration

```text
NO. With JPA/HIBERNATE technology, On Installation Fundmaster XE generates tables from entities.
````

## Conversion Process

```text
1. Modify Models/Entities to be postgres compatible . Eg using SEQUENCE generation type IDs
   source: https://vladmihalcea.com/jpa-entity-identifier-sequence/
   https://thorben-janssen.com/hibernate-postgresql-5-things-need-know/
   Changing column precision scales from 20 to 16 for Bigdecimals
2. Convert DTOs variables to lower case, postgres converts everything to lower case. Do not use \"xxx\" in sql statements.
3. Replace NVL with coalesce.
4. Replace sysdate() with aws_oracle_ext.sysdate().
5. Cast to BigInteger all select count resultsets and single column results whose datatype is bigint, same to any other datatype else will throw an error.
6. Replace all `hibernate_sequence.nextval` with nextval('hibernate_sequence').
7. Replace list_agg with string_agg.
8. Use appropriate date functions.
9. Check all native queries
10. Cast to BigInteger all select nextval('hibernate_sequence') resultsets
11. All sub-queries must have an alias
12. Use 'yyyy-MM-dd' in to_date() function, and convert all first arguments to string. Use custom function dateformat to achieve this. see examples below
13. Remove force keyword in create view sql

```

### Process

- [x] Set up PostgresSQL Database
- [x] Set up data sources and persistence
- [x] Make initial XE deployment
- [x] Fix the models/entities
- [x] Redeploy
- [ ] Migrate Views & Routines
- [ ] Migrate Native Queries
- [x] Data Migration, From Oracle cloud to postgres db
- [ ] Testing

### Webapp folder

~~~~
-user_doc
-WEB-INF
-XiManual
-backup.txt
template_instructions.txt
~~~~

## Changes Made In Code

### Models

```java
//@GeneratedValue(strategy = GenerationType.IDENTITY)
@GeneratedValue(strategy = GenerationType.SEQUENCE)
private Long id;
//@Column(name = "spot_rate", precision=16,scale=20)
@Column(name = "spot_rate")
private BigDecimal spotRate;

//DTO
//used BigInteger and Long for Ids, all variables in lowercase for mapping using transformers
````

## Native Queries

### UPDATE

```sql
-- update MEMBERS m set m.EXIT_ID=NULL where m.ID=:memberId and m.EXIT_ID=:exitId and m.MBSHIP_STATUS='ACTIVE';
update MEMBERS m
set EXIT_ID=NULL
where m.ID = :memberId
  and m.EXIT_ID = :exitId
  and m.MBSHIP_STATUS = 'ACTIVE';
```

### SELECT

```sql
-- select m.MBSHIP_STATUS status, mb.GENDER gender from members m INNER JOIN MEMBERS_BIOS mb on m.MEMBERBIO_ID = mb.ID where m.ID=7165;
select m.MBSHIP_STATUS AS status, mb.GENDER AS gender
from members m
         INNER JOIN MEMBERS_BIOS mb on m.MEMBERBIO_ID = mb.ID
where m.ID = 7165;
```

### HIBERNATE SEQUENCE

````sql
select nextval('hibernate_sequence');
````

### ADD MONTHS

```sql
select add_months(cast(sysdate() as date), 10);
```

### MONTHS BETWEEN

```sql
-- select months_between(:startPeriod,sysdate) 
select DATE_PART('year', :startPeriod::date) - DATE_PART('year', current_timestamp::date) --Returns number of Years
           use months_between(date, date) function
Eg select months_between('2022-07-29 05:14:48'::date,current_date::date);
```

### DATE TIME

```sql
-- SELECT sysdate
select current_timestamp;

use aws_oracle_ext.sysdate();
```

### TO_DATE

```sql
select to_date('2021-08-26', 'YYYY-MM-DD');
```

### DATE DIFF IN DAYS

```sql
select (current_date - '2021-08-01') as dys;
select daterange_subdiff(current_date, '2021-08-01') as dys;
```

### LAST_DAY

```sql
-- Created custom function last_day(date)
use
select last_day(now()::date);

```

### ROWNUM

```sql
-- select  ROWNUM FROM MEMBERS m;
select row_number() over (order by m.id)
FROM MEMBERS m;
-- select  ROWNUM FROM MEMBERS m where rownum=1;
select row_number() over (order by m.id)
FROM MEMBERS m
LIMIT 1;
```

### NVL

```sql
-- select nvl(c.ee, 0);
select coalesce(c.ee, 0);
```

### INSTR

```sql
-- select INSTR('xxx.xxx', '.');
select position('.' in 'xxx.xxx');
```

### LOB

```java
  //add @Type for postgres to know what type of lob ie ImageType/TextType etc
@Lob
@Type(type = "org.hibernate.type.TextType");
```

### DESCRIBE TABLE

~~~sql
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'members';
~~~

### LIST ALL PROCEDURES

~~~sql
select n.nspname as schema,
       p.proname as procedure
from pg_proc p
         join pg_namespace n on p.pronamespace = n.oid
where n.nspname not in ('pg_catalog', 'information_schema')
  and p.prokind = 'p'
~~~

### FORMAT DATE

~~~sql
SELECT TO_CHAR(NOW() :: DATE, 'Mon dd, yyyy');
~~~

### Examples

~~~sql
select todate(current_date::date);
select to_date('30-Sep-2021', 'dd-Mon-yyyy');
select todate(to_char('2021-09-30'::date, 'dd-MON-yyyy'));
select todate('30-Sep-2021');
select dateformat(now()::date);
select to_date(to_char(now()::date, 'dd-Mon-yyyy'), 'dd-Mon-yyyy');
select to_date('2020-08-30'::date, 'dd-Mon-yyyy');
select todate(current_date);
select date_trunc('month', current_date);
select todate(date_trunc('month', current_date));
select to_timestamp('2022-01-01', 'YYYY-MM-DD');
~~~

### ERROR

- [x] NonUniqueDiscoveredSqlAliasException: Encountered a duplicated sql alias
  `sql has more than one column with same name, introduce alias
  `
- [x] Could not resolve PropertyAccess for dateAcquired on class com.systech.fm.dto.accounts.FixedAssetsDto
  `Find the attribute in the DTO and change to lowercase`

## Login User

~~~bash
psql -U posgres
pwd [postgres]
psql -V psql [ psql (PostgreSQL) 12.6 ]
~~~

## Import Database

~~~bash
pg_restore -U postgres --dbname=fm --create --verbose c:\pgbackup\fm.tar
~~~

## Run SQL

~~~bash
#LOGIN TO PSQL
\i path_to_sql_file
~~~

## Import Million Records Faster

~~~postgresql
create table peopleNames
(
    name  varchar(255),
    sex   varchar(255),
    sex_1 varchar(255),
    count bigint,
    year  bigint
);
--FROM TERMINAL
COPY peopleNames FROM '/path/to/pp-complete.csv' with (format csv, encoding 'utf-8', header false, null '', quote '"');
~~~

## Split Delimited String

~~~postgresql
select unnest(string_to_array('1,2,3,4,5', ',')) as id;
--or
SELECT regexp_split_to_table('1,2,3,4,5', ',') AS ID;
--https://medium.com/swlh/three-routes-convert-comma-separated-column-to-rows-c17c85079ecf
~~~

## Drop All Views

~~~sql
SELECT 'DROP VIEW ' || (table_name) || ' cascade;'
FROM information_schema.views
WHERE table_schema IN ('public');
--copy and save to file and execute
~~~

## Show All Tables In Schema

~~~sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  and table_name like 'act_%';
----------------------------
SELECT 'DROP TABLE ' || (table_name) || ' cascade;' as qry
FROM information_schema.tables
WHERE table_schema IN ('public')
  and table_name like 'act_%';
~~~

## Important Scripts

~~~sql

ALTER SEQUENCE hibernate_sequence RESTART WITH 12879141;

select VIEW_NAME, OWNER
from all_views
where OWNER = 'FM'; --ORACLE DB

select viewname
from pg_catalog.pg_views
where schemaname = 'public'; --get all views in schema

select count(viewname)
from pg_catalog.pg_views
where schemaname = 'public';

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'Xe';

SELECT *
FROM pg_stat_activity
WHERE datname = 'Xe';

SELECT datname
FROM pg_database;--get database names

DELETE
FROM pg_catalog.pg_database
WHERE datname = 'Xe';

SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
  AND schemaname != 'information_schema';

SELECT tablename
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
  AND schemaname != 'information_schema';
~~~

## Installing Extension

~~~text
   We will be installing tsm_system_rows extension for quick randomizing rows in a table.
   1.   Download postgres source from [https://www.postgresql.org/ftp/source/]
   2.   Unzip and cd to folder.
   3.   bash# sudo ./configure --without-readline --with-pgconfig=/usr/pgsql-14/bin/pg_config
   4.   bash# make
   5.   cd ./contrib/tsm_system_rows/
   6.   bash# sudo make install
   7.   We need to know where to paste the output, run (CREATE EXTENSION tsm_system_rows;) and note the error path
   8.   Copy tsm_system_rows--1.0.sql & tsm_system_rows.control to [/usr/pgsql-14/share/extension]
   9.   Copy tsm_system_rows.so to [/usr/pgsql-14/lib]
   10.  Lauch psql shell [psql -U postgres]
   11.  psql# create extension tsm_system_rows;
   12.  Test psql# SELECT * FROM my_table TABLESAMPLE SYSTEM_ROWS(100);
   
   Installing pg_cron extension
    git clone https://github.com/citusdata/pg_cron.git
    cd pg_cron
    # Ensure pg_config is in your path, e.g.
    export PATH=/usr/pgsql-11/bin:$PATH
    make && sudo PATH=$PATH make install
~~~

## Database Queries

````sql
select 'alter table ' || owner || '.' || table_name || ' disable constraint ' || constraint_name || ';'
from user_constraints;
select 'alter table ' || owner || '.' || table_name || ' enable constraint ' || constraint_name || ';'
from user_constraints;

SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'Xe';

SELECT *
FROM pg_stat_activity
WHERE datname = 'Xe';

SELECT datname
FROM pg_database;

DELETE
FROM pg_catalog.pg_database
WHERE datname = 'Xe';

SELECT *
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
  AND schemaname != 'information_schema';

SELECT tablename
FROM pg_catalog.pg_tables
WHERE schemaname != 'pg_catalog'
  AND schemaname != 'information_schema';
````

## Alter Table Columns

````sql
with mitables
         as (select unnest(ARRAY ['closing_balances','BENEFITS','BENEFIT_PAYMENTS','PROV_BEN_BAL','FUND_VALUES']) as tb)
select 'alter table ' || (select tb from mitables where lower(tb) = table_name) || ' alter column ' || column_name ||
       ' type numeric(19,10);'
from information_schema.columns
where table_name in (select lower(tb) from mitables)
  and data_type = 'numeric';

select *
from information_schema.columns
where table_name = 'closing_balances'
  and data_type = 'numeric';

select 'update closing_balances set ' || column_name || '=0 where ' || column_name || ' is null and id=1283097;'
from information_schema.columns
where table_name = 'closing_balances'
  and data_type = 'numeric';
````

## Reset Database Notifications

~~~SQL
  update SCHEMES
  set EMAIL=null,
      SECONDARY_EMAIL=null,
      FIXED_PHONE=null,
      SECONDARY_PHONE=null,
      ALLOW_NOTIFICATIONS='NO';

-- schemenames

update SPONSORS
set EMAIL=null,
    FIXED_PHONE=null,
    SECONDARY_PHONE=null,
    SECONDARY_EMAIL=null;

update COMPANIES
set EMAIL=null,
    SECONDARY_EMAIL=null,
    FIXED_PHONE=null,
    SECONDARY_PHONE=null;

-- member names

update MEMBERS_BIOS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(replace(lower(FIRSTNAME), ' ', ''), '@mailinator.com'),
    SECONDARY_EMAIL=concat(replace(lower(coalesce(SURNAME, FIRSTNAME)), ' ', ''), '@mailinator.com'),
    PIN=null,
    ID_NO=null;


update NOTIFICATION_CONFIGS
set benefitpaymentappr='NO',
    benefitpaymentcert='NO',
    benefitpaymentpost='NO',
    claimapproval='NO',
    claimauthorization='NO',
    claimcancellation='NO',
    claimcertification='NO',
    claiminitialization='NO',
    claimmissingdocs='NO',
    claimprocessingtoacc='NO',
    contributionbilling='NO',
    contributionposting='NO',
    contributionreceipting='NO',
    endorsementapproval='NO',
    endorsementrejection='NO',
    isglobal='NO',
    memberapproval='NO',
    memberauthorization='NO',
    memberbioupdate='NO',
    memberbirthday='NO',
    membercertification='NO',
    membercreation='NO',
    onetimemiscellaneousmsg='NO',
    reserveinflow='NO',
    reserveoutflow='NO',
    retirementcontributionsauthorization='NO',
    retirementcontributionsprocessing='NO',
    schemecreation='NO',
    sponsorcontrreminder='NO',
    sponsorcontrwithoutschedule='NO',
    sponsoronmemberapproval='NO',
    straighttobankpush='NO',
    straighttobankrollback='NO',
    contributionsponsorposting='NO',
    deathinretirement='NO',
    eventsdocuments='NO',
    eventsreminder='NO',
    eventsupdate='NO',
    generationofcoe='NO',
    pensionarrears='NO',
    pensiondeduction='NO',
    pensionrevisionapproval='NO',
    pensionrevisioncertification='NO',
    pensionerapproval='NO',
    pensionerreinstatement='NO',
    pensionersuspension='NO',
    retirementnotification='NO',
    sendnotificationonfirstdeclaredbalancerun='NO',
    usesecondaryemailforclaimrelatednotification='NO',
    docsexpiry='NO',
    eventdeclination='NO',
    exitoptionform='NO',
    hremail='NO',
    hrretirementnotification='NO',
    member_ben_creation='NO',
    member_ben_update='NO',
    membersnotcontributedinawhile='NO',
    allow_notification_to_scheme='NO',
    ret_contr_authorization='NO',
    ret_contrs_proc='NO',
    declared_bal_not='NO',
    trusteelicenseexpiry='NO',
    secondary_email_claim_not='NO',
    withoutnominatedbeneficiary='NO',
    membermerger='NO',
    members_not_cont_dea='NO',
    transfervalueoptionform='NO';

-- minor names

update MINORS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(replace(lower(FIRST_NAME), ' ', ''), '@mailinator.com'),
    SECONDARY_EMAIL=concat(replace(lower(coalesce(SURNAME, FIRST_NAME)), ' ', ''), '@mailinator.com');

update SERVICE_PROVIDERS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(replace(lower(NAME), ' ', ''), '@mailinator.com'),
    SECONDARY_EMAIL=concat(replace(lower(coalesce(NAME, ACCOUNTNUMBER)), ' ', ''), '@mailinator.com');

update CUSTODIANS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(replace(lower(NAME), ' ', ''), '@mailinator.com'),
    SECONDARY_EMAIL=concat(NAME, '@mailinator.com');

update banks
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(replace(lower(NAME), ' ', ''), '@mailinator.com'),
    SECONDARY_EMAIL=concat(NAME, '@mailinator.com');

update PRINCIPAL_OFFICERS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(lower(replace(NAME, ' ', '')), '@mailinator.com'),
    SECONDARY_EMAIL=concat(lower(replace(NAME, ' ', '')), '@mailinator.com');

update USERS
SET MOBILE_NUMBER=NULL,
    EMAIL=concat(lower(replace(FIRSTNAME, ' ', '')), '@mailinator.com');

update SMTP_MAIL_SETUP
set ALLOWNOTIFICATIONS='NO',
    SMTP_AUTH_USER=null,
    SENDING_EMAIL='bursting.reports@gmail.com',
    SMTP_AUTH_PWD='some_pwd';

update ESTATE_MANAGERS
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(lower(replace(NAME, ' ', '')), '@mailinator.com'),
    SECONDARY_EMAIL=concat(lower(replace(NAME, ' ', '')), '@mailinator.com');

update BENEFICIARIES
SET CELL_PHONE=NULL,
    FIXED_PHONE=null,
    EMAIL=concat(lower(replace(FIRSTNAME, ' ', '')), '@mailinator.com'),
    SECONDARY_EMAIL=concat(lower(replace(FIRSTNAME, ' ', '')), '@mailinator.com');


delete
from MAILS;
delete
from SMSES;

commit;

~~~

## Backup

### All Commands

~~~bash
Export	:	pg_dump -U postgres -d testdb -h 127.0.0.1 > dump$(date +%Y%m%d%H%M%S).sql
		pg_dump -U postgres -d fundmaster -h 127.0.0.1 > backup/fundmaster$(date +%Y%m%d%H%M%S).sql
Import	:	psql -U postgres -d xe -a -f myInsertFile
		\i dump.sql

Export	:	pg_dump -U postgres -d xe -v --format=t -h 127.0.0.1 --encoding=UTF-8 > dump$(date +%Y%m%d%H%M%S).tar
Import	:	pg_restore -c -U postgres -d pacific -v ./aws-schemas.tar -W

		-- Large Databases
Export	:	pg_dump -U username -j num -F d -f out.dir dbname -v
		pg_dump -U postgres -j 10 -F d -f ./nassitdb$(date +%Y%m%d%H%M%S) nassitdb -v
Import	:	pg_restore -U postgres -j 10 -d nassitdb ./nassitdb$(date +%Y%m%d%H%M%S) -v

Export	:	pg_dump dbname | gzip > filename.gz
Import	:	gunzip -c filename.gz | psql dbname

Export	:	pg_dump dbname | split -b 2G - filename
Import	:	cat filename* | psql dbname

Export	:	pg_dump -Fc dbname > filename
Import	:	pg_restore -d dbname filename

		-- Large Databases
Export	:	pg_dump -U username -v -Fc dbname | split -b 2G - filename
		pg_dump -U postgres -v -Fc nassitdb | split -b 5G - nassitdb$(date +%Y%m%d%H%M%S)
Import	:	pg_restore -j 8 -d dbname filename -v
~~~

### Favourite Commands

~~~bash
-- Fast
pg_dump -U postgres -j 10 -F d -f ./nassitdb$(date +%Y%m%d%H%M%S) nassitdb -v
pg_restore -U postgres -j 8 -d nassitdb ./nassitdb$(date +%Y%m%d%H%M%S) -v

-- Slower
pg_dump -U postgres -v -Fc nassitdb | split -b 5G - nassitdb$(date +%Y%m%d%H%M%S)
pg_restore -U postgres -j 8 -d nassitdb nassitdump -v
~~~

## Remote Connection

~~~bash
psql -h 3.7.212.215 -p 5432 -d fundmaster -U postgres -W 
~~~

## Creating A Cluster

Switch to user postgres

```bash
 sudo su - postgres
```

Create a data directory to store cluster db files

```bash 
mkdir <YOUR_FOLDER_NAME>
```

Initialize the database cluster

```bash 
initdb -D <YOUR_FOLDER_NAME>
```

Edit configuration files

```bash
cd <YOUR_FOLDER_NAME>
```

Edit <span style="color:orangered"><i>postgresql.conf</i></span>

> localhost: '*'

> port : <YOUR_PORT>

Edit <span style="color:orangered"><i>pg_hba.conf</i></span>

> Edit to match your desired configurations

Start the cluster

```bash 
pg_ctl -D <YOUR_FOLDER_NAME> -l logfile start
```

Stop the cluster

```bash 
pg_ctl -D <YOUR_FOLDER_NAME> -m immediate stop
```

## Streaming Replication v14

We need two servers i.e Master & Slave.

### MASTER SERVER

Create Replication user

```sql
 CREATE ROLE replicator WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT REPLICATION CONNECTION LIMIT -1 PASSWORD 'Qwerty123';
```

Edit <span style="color:orangered"><i>postgresql.conf</i></span>

<blockquote>
  wal_level = replica <br>
  max_wal_senders = 100
</blockquote>

Edit <span style="color:orangered"><i>pg_hba.conf</i></span>

<blockquote>
  host replication all <span style="color:deepskyblue">slave_ip_address/32 </span> trust <br>
  host replication replicator <span style="color:deepskyblue">slave_ip_address/32 </span> trust
</blockquote>

Restart the postgres service.

### SLAVE SERVER

Create a directory.

```bash
mkdir /app/postgresql/pgdatabase/data
```

Now transfer data from master to slave.

<code>
pg_basebackup -h <span style="color:orangered">master_ip</span> -U replicator -D /app/postgresql/pgdatabase/data --write-recovery-conf --progress --verbose
</code>

Assign the postgres owner of all migrated directories

<code>
  chmod -R 0700 /app/postgresql/pgdatabase/data 
</code>

Launching a replica and checking the replication status.

<code>pg_ctl start /app/postgresql/pgdatabase/data</code>

How to stop

<code>pg_ctl -D /var/lib/pgsql/9.6/data -m immediate stop</code>

If error change permissions as below

Change directory user and group.

<code>
  chown <span style="color:deepskyblue">user</span> <span style="color:#77bc71">/var/run/folderName</span>
 </code>
<br>
<code>  
  chgrp <span style="color:deepskyblue">user</span> <span style="color:#77bc71">/var/run/folderName</span>
</code>

### CONFIRM

On the Master Server run :

````sql
select application_name, state, sent_lsn, write_lsn, sync_state
from pg_stat_replication;
````

## Master-to-Master Replication v16
To achieve Multi-master asynchronous replication using Bucardo

> [Bucardo](https://bucardo.org/Bucardo/): is an asynchronous PostgreSQL replication system, allowing for multi-source,
> multi-target operations. It was developed at Backcountry by Jon Jensen and Greg Sabino Mullane of End Point Corporation,
> and is now in use at many other organizations. Bucardo is free and open source software released under the BSD license.

### References:
1. [PostgreSQL Replication](https://medium.com/@logeshmohan/postgresql-replication-using-bucardo-5-4-1-6e78541ceb5e)
2. [Bucardo Installation](https://bucardo.org/Bucardo/installation/)

### Requirements
This tutorial was implemented in Fedora 39
1. Two or more database cluster
2. Bucardo

### Setup Database
This assumes Postgres was compiled with Perl support. Install Perl
```bash 
sudo yum install perl-devel
```
Create Extension in template1 postgres database
```sql 
CREATE EXTENSION plperl;
CREATE LANGUAGE plperlu;
```
Create bucardo user
```sql
create role bucardo superuser login password 'PASSWORD';
```
Create bucardo database using **bucardo** user
```sql
create database bucardo;
```
Create <span style="color:orangered"><i>~/.pgpass</i></span> file
```bash
touch .pgpass
```

Edit the file with following contents:
> 127.0.0.1:5432:bucardo:bucardo:<BUCARDO_USER_PASSWORD> <br/>
> 127.0.0.1:5432:*:postgres:<POSTGRES_USER_PASSWORD>

Edit <span style="color:orangered"><i>pg_hba.conf</i></span> file, add lines

```txt
local	bucardo		bucardo					    trust
host	bucardo		bucardo		0.0.0.0/0		trust
```
Restart postgres service
```bash 
systemctl restart postgresql-16.service
```

Change file permission
```bash
sudo chmod 0600 .pgpass 
```

### Other Installations (Fedora 39)
```bash 
sudo yum install perl-Pod-Html
sudo yum install perl-Test-Simple
sudo yum -y install perl-DBI
sudo yum install perl-DBD-Pg
sudo dnf install postgresql16-plperl
sudo dnf install perl-sigtrap
sudo dnf install perl-Sys-Hostname
sudo dnf install perl-Log-Report-Dispatcher-Syslog
sudo dnf install perl-open.noarch
```
### Install Bucardo

First we need to install DBIx::Safe. Download it [here](https://bucardo.org/DBIx-Safe/)
> DBIx::Safe is a Perl module that allows for safe and controlled access to a DBI database handle. It is similar in spirit to the standard Perl module “Safe”. It is used by Bucardo to ensure that custom code does not interfere with the normal running of Bucardo.

```bash 
tar xzf DBIx-Safe-1.2.5.tar.gz
cd DBIx-Safe-1.2.5
perl Makefile.PL
make
sudo make install
```

Proceed to bucardo installation
> Refer to references section for installation link and documentation. Steps:

Download latest version of Bucardo [here](https://bucardo.org/Bucardo/#obtaining-bucardo), untar it and switch to the directory:
```bash 
tar xzf Bucardo-5.6.0.tar.gz
cd Bucardo-5.6.0
perl Makefile.PL
make
sudo make install
```
Create this directories
```bash 
sudo mkdir /var/run/bucardo/
sudo mkdir /var/log/bucardo/
```

Install bucardo
```bash 
bucardo install
```
You will have an opportunity to change the default parameters:
```html 
Current connection settings:

1. Host:          <none>
2. Port:          5432
3. User:          postgres
4. Database:      postgres
5. PID directory: /var/run/bucardo 
```

### Testing
> We need a database in both masters with some similar tables:

Setting Master 1 (SourceDb)
```sql 
psql -U postgres -W
create database clustered;
\c clustered
create table one(id bigint primary key ,num bigint);
```
> Repeat for Master 2 (DestDb)


Setting Bucardo

> Add the databases
>  Bucardo needs to know about each database it needs to talk to

```bash 
bucardo add db sourcedb dbhost=127.0.0.1 dbport=5432 dbname=clustered user=postgres dbpass=postgres

bucardo add db destdb dbhost=127.0.0.1 dbport=5433 dbname=clustered user=postgres dbpass=postgres
```

```bash 
bucardo list dbs
```
```bash 
bucardo list dbgroups
```

> Add the tables
> Bucardo also needs to know about any tables that it may be called on to replicate. (Adding tables by the add table command does not actually start replicating them.)

```bash 
bucardo add all tables --herd=source_dest db=sourcedb
bucardo add all tables --herd=dest_source db=destdb
```

```bash 
bucardo list tables
```

> Add the sequences (If exists)
> 1. Sequences should not be similar to avoid conflict
> 2. [Best Practices](https://bucardo.org/Bucardo/operations/sequences)

```bash 
bucardo add all sequences --herd=source_dest
bucardo add all sequences --herd=dest_source
```

```bash 
bucardo list herds
bucardo list relgroups
```
Set logging levels
```bash
bucardo set quick_delta_check=0
bucardo set log_level=VERBOSE
```

> Add the syncs
> A sync is a named replication event. Each sync has a source relgroup.

```bash
bucardo add sync sync_source_dest relgroup=source_dest db=sourcedb,destdb
bucardo add sync sync_dest_source relgroup=dest_source db=destdb,sourcedb
```

```bash 
bucardo list syncs
```

### Start Bucardo
> The final step is to start the Bucardo service:

```bash 
bucardo start
```
Verify that the Bucardo daemons are running
```bash 
 ps -Afw | grep Bucardo
```
### Test Replication
> Insert some records in SourceDb table(s)
```sql
    with data as (
        select * from generate_series(1,2000000) as id
    )
    insert into one(num)
    select id
    from data;
```
> Repeat for DestDb table(s)

### Checking Status

```bash 
 bucardo status
```

### Stopping Replication

```bash 
 bucardo stop
```

### Sample using Fundmaster Database

-------------Start Sample----------------------
> Assumes you have already loaded your existing database to both masters

```bash
bucardo add db pac_sourcedb dbhost=127.0.0.1 dbport=5432 dbname=pacific user=bucardo dbpass=bucardo
bucardo add db pac_destdb dbhost=127.0.0.1 dbport=5433 dbname=pacific user=bucardo dbpass=bucardo
bucardo add all tables --herd=pac_source_dest db=pac_sourcedb
bucardo add all tables --herd=pac_dest_source db=pac_destdb
```

> Remove tables without Primary Key

```sql
with mytables as (
SELECT table_schema || '.' || table_name as tbName
FROM information_schema.tables
WHERE
(table_catalog, table_schema, table_name) NOT IN (
SELECT table_catalog, table_schema, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'PRIMARY KEY') AND
table_schema NOT IN ('information_schema', 'pg_catalog', 'pgq', 'londiste')
)
select 'bucardo remove table '|| m.tbName|| ' db=pac_sourcedb' from mytables m
union all 
select ' bucardo remove table '|| m.tbName|| ' db=pac_destdb' from mytables m;
```
> Run the generated scripts above in bash

```bash
bucardo remove table public.fmxi_lv db=pac_sourcedb
bucardo remove table public.fmxi_lv db=pac_destdb

bucardo validate all
bucardo reload

bucardo list herds

bucardo add sync pac_source_dest_sync relgroup=pac_source_dest db=pac_sourcedb,pac_destdb

bucardo add sync pac_dest_source_sync relgroup=pac_dest_source db=pac_destdb,pac_sourcedb
```

### Dealing with Sequences

Replicating sequences can be difficult, to avoid that:
> Update sequences to start at a value less 1 the other and increment by 2 

```sql
-- master 1 database
alter sequence hibernate_sequence start 1 increment 2 no maxvalue ;

-- master 2 database
alter sequence hibernate_sequence start 2 increment 2 no maxvalue ;
```
> Having more than 2 masters complicates the problem further 🤔

-------------End Sample----------------------
<hr/>

## Load Balancing
> Load balancing refers to efficiently distributing incoming network traffic across a group of backend servers, also known as a server farm or server pool. The aim to achieve a load balancer for postgreSQL cluster with multimaster and slave databases.

### 1. HAProxy
> [HAProxy](https://www.haproxy.org/) is a free, very fast and reliable reverse-proxy offering high availability, load balancing, and proxying for TCP and HTTP-based applications.

### References:
1. [Official Site](https://www.haproxy.com/blog/haproxy-configuration-basics-load-balance-your-servers)
2. [Youtube](https://www.youtube.com/watch?v=k4if9Ywht8U)

> This tutorial was implemented in Fedora 39 on a master-slave unidirectional replica

### Installation
There are 2 ways for installing:
1. [Using source packages](http://www.haproxy.org/download/2.9/src/haproxy-2.9.5.tar.gz)
2. Using native libraries

> We will be using native libraries

### Process

Install HAProxy
```bash 
yum install -y haproxy
```

Setting up HAProxy for your server
```bash 
mkdir  -p /etc/haproxy
mkdir  -p /var/lib/haproxy
touch /var/lib/haproxy/stats
```
create a service
```bash 
systemctl enable haproxy.service
```
Add User
```bash 
useradd -r haproxy
haproxy -v
cd /etc/haproxy/
```
Backup config file before your edit
```bash 
cp haproxy.cfg haproxy.cfg.bkp
```

Edit configuration file
```bash 
vim haproxy.cfg
```
> remove backend static & backend app sections

Defaults section content
```text
defaults
	    mode                    tcp
	    log                     global
	    option                  tcplog
	    option                  dontlognull
	    option                  http-server-close
	    option                  redispatch
	    retries                 3
	    timeout http-request    10s
	    timeout queue           1m
	    timeout connect         10s
	    timeout client          1m
	    timeout server          1m
	    timeout http-keep-alive 10s
	    timeout check           10s
	    maxconn                 3000
```
Changes made
1. mode set to **tcp**
2. option                  **tcplog**
3. maxconn                 **3000**

Frontend section content
```text
frontend	main
	    mode        tcp
	    bind        *:5000
	    acl readonly.pgsql nbsrv(pgsql) eq 0
	    use_backend readonly.pgsql if readonly.pgsql
	    acl pgsql nbsrv(pgsql) gt 0
	    use_backend pgsql if pgsql
```
> The section is the entry point of request. The proxy listens to port **5000**, for select statements will be sent to readonly backend service and for write operations will be sent to pgsql backend service

Backend pgsql section content
```text
backend pgsql
	    mode        tcp
	    option      tcp-check
	    server  master-db 127.0.0.1:5432 check
```
> Forward request to master server port 5432

Backend readonly.pgsql section content
```text
backend readonly.pgsql
	    mode        tcp
	    option      tcp-check
	    server  slave-db  127.0.0.1:5434 check
```
> Forward request to slave server port 5434

### Complete configuration
After the editing, the haproxy.cfg should look like below
```text
defaults
	    mode                    tcp
	    log                     global
	    option                  tcplog
	    option                  dontlognull
	    option                  http-server-close
	    option                  redispatch
	    retries                 3
	    timeout http-request    10s
	    timeout queue           1m
	    timeout connect         10s
	    timeout client          1m
	    timeout server          1m
	    timeout http-keep-alive 10s
	    timeout check           10s
	    maxconn                 3000

	frontend	main
	    mode        tcp
	    bind        *:5000
	    acl readonly.pgsql nbsrv(pgsql) eq 0
	    use_backend readonly.pgsql if readonly.pgsql
	    acl pgsql nbsrv(pgsql) gt 0
	    use_backend pgsql if pgsql

	backend pgsql
        balance leastconn
	    mode        tcp
	    option      tcp-check
	    server  master-db 127.0.0.1:5432 check

	backend readonly.pgsql
        balance roundrobin
	    mode        tcp
	    option      tcp-check
	    server  slave-db  127.0.0.1:5434 check
```
Another sample configuration
```text
global
    log         127.0.0.1 local2
    chroot      /var/lib/haproxy
    pidfile     /var/run/haproxy.pid
    maxconn     4000
    user        haproxy
    group       haproxy
    daemon
    stats socket /var/lib/haproxy/stats mode 660 level admin
    stats timeout 30s
    # utilize system-wide crypto-policies
    ssl-default-bind-ciphers PROFILE=SYSTEM
    ssl-default-server-ciphers PROFILE=SYSTEM

defaults
    mode		    tcp
    log                     global
    option                  tcplog
    option 	            tcpka
    option                  dontlognull
    option	            http-server-close
    option                  redispatch
    retries                 3
    timeout http-request    10s
    timeout queue           1m
    timeout connect         10s
    timeout client          1m
    timeout server          1m
    timeout http-keep-alive 10s
    timeout check           10s
    maxconn                 3000

#---------------------------------------------------------------------
# main frontend which proxys to the backends
#---------------------------------------------------------------------

# Frontend for read-only operations
frontend readonly_frontend
    bind *:5001
    mode tcp
    tcp-request content accept if WAIT_END
    tcp-request inspect-delay 1s
    tcp-request content accept if WAIT_END
    acl is_read_only dst_port 5434
    use_backend readonly_backend if is_read_only
    default_backend write_backend

# Frontend for write operations
frontend write_frontend
    bind *:5000
    mode tcp
    tcp-request content accept if WAIT_END
    tcp-request inspect-delay 1s
    tcp-request content accept if WAIT_END
    use_backend write_backend

# Backend for read-only operations
backend readonly_backend
    mode tcp
    balance roundrobin
    server pg_readonly_node1 127.0.0.1:5434 check

# Backend for write operations
backend write_backend
    mode tcp
    balance leastconn
    server pg_write_node1 127.0.0.1:5432 check
    server pg_write_node2 127.0.0.1:5433 check
```

### Finish configuration

```bash 
setsebool -P haproxy_connect_any 1
systemctl restart haproxy.service
```
Check service
```bash
netstat -antp | egrep 5000
journalctl -xeu haproxy.service
```

### Testing

```bash
psql -h 127.0.0.1 -p 5000 -U postgres -d postgres -c "select setting from pg_settings where name='port'";
psql -h 127.0.0.1 -p 5000 -U postgres -d postgres -c "select inet_server_addr(), inet_server_port()";
```
> We are making the requests to proxy port 5000, we expect it to redirect our request to the servers specified

**Do more tests using pgbench and monitor**

<hr/>

### 2. PgPool-II
> Read [Reference Guide](https://www.pgpool.net/docs/latest/en/html/runtime-config-load-balancing.html)

Install
```bash
sudo dnf install pgpool-II
```
Configuration
```bash 
cd /etc/pgpool-II
cp pgpool.conf.sample pgpool.conf
vi  pgpool.conf
```
Update **pgpool.conf** contents
```text
listen_addresses = '*'
port = 9999

pid_file_name = 'pgpool.pid'

backend_hostname0 = 'localhost'
backend_port0 = 5432
backend_weight0 = 0   # send select statements to qreplica
backend_data_directory0 = '/var/lib/pgsql/16/data'
backend_flag0 = 'ALWAYS_PRIMARY'
backend_application_name0 = 'server5432'
                                   
backend_hostname1 = 'localhost'
backend_port1 = 5434
backend_weight1 = 1
backend_data_directory1 = '/var/lib/pgsql/replica'
backend_flag1 = 'ALLOW_TO_FAILOVER'
backend_application_name1 = 'server5434'

health_check_period = 10
load_balance_mode = on

#replication user and password
sr_check_user = 'replicator'
health_check_user = 'replicator'
sr_check_password = 'postgres'
health_check_password = 'postgres'

#comment in production
log_statement = on
log_per_node_statement = on

allow_clear_text_frontend_auth = on
authentication_timeout = 1min
allow_sql_comments = on
ignore_leading_white_space = on

```

Test Load Balancing & Read-Write separation
```bash
sudo su &&  pgpool -Dn
# OR
sudo su &&  pgpool -D
```

Start with logfile
```bash
pgpool -Dn > /var/log/pgpool-II/pgpool.log 2>&1 &
```

Confirm PgPool is running
```bash
psql -U postgres -h 127.0.0.1 -p 9999 --command="SHOW POOL_NODES;"
```
> 9999 - PgPool port

You can also configure PgPool II for connection pooling
> You can use **PgBouncer** instead, read below
```text
process_management_mode = dynamic
process_management_strategy = gentle
num_init_children = 32
min_spare_children = 1
max_spare_children = 32
max_pool = 32
child_life_time = 1min
```

****

## Failover & Failback
> 

## Connection Pooling

> Managing database connections to improve performance and reduce the overhead of database connections.
> [Read More](https://medium.com/@dmitry.romanoff/using-pgbouncer-to-improve-performance-and-reduce-the-load-on-postgresql-b54b78deb425)

### PgBouncer

Installing

```bash
sudo yum install pgbouncer
```

**Configuration**

Open configuration file
```bash
sudo vi /etc/pgbouncer/pgbouncer.ini
```

> You can configure as shown [here](https://medium.com/@dmitry.romanoff/using-pgbouncer-to-improve-performance-and-reduce-the-load-on-postgresql-b54b78deb425)

Authentication
```bash 
select concat('"',usename,'" "',passwd,'"') from pg_shadow;
```
> Add the query result to _userslist.txt_

Sample configuration
> This also works with pg-pool

```text
;; database name = connect string
;;
;; connect string params:
;;   dbname= host= port= user= password=
;;   client_encoding= datestyle= timezone=
;;   pool_size= connect_query=
[databases]

; foodb over unix socket
;foodb =

; redirect bardb to bazdb on localhost
;bardb = host=localhost dbname=bazdb

; access to dest database will go with single user
;forcedb = host=127.0.0.1 port=300 user=baz password=foo client_encoding=UNICODE datestyle=ISO connect_query='SELECT 1'
* = host=127.0.0.1 port=5000 user=postgres password=postgres client_encoding=UNICODE datestyle=ISO connect_query='SELECT 1'

; use custom pool sizes
;nondefaultdb = pool_size=50 reserve_pool_size=10

; fallback connect string
;* = host=testserver

;; Configuration section
[pgbouncer]

;;;
;;; Administrative settings
;;;

logfile = /var/log/pgbouncer/pgbouncer.log
pidfile = /var/run/pgbouncer/pgbouncer.pid

;;;
;;; Where to wait for clients
;;;

; ip address or * which means all ip-s
listen_addr = 127.0.0.1
listen_port = 6432

; unix socket is also used for -R.
; On debian it should be /var/run/postgresql
;unix_socket_dir = /tmp
;unix_socket_mode = 0777
;unix_socket_group =

;;;
;;; Authentication settings
;;;

; any, trust, plain, crypt, md5
auth_type = trust
;auth_file = /8.0/main/global/pg_auth
auth_file = /etc/pgbouncer/userlist.txt

;; Query to use to fetch password from database.  Result
;; must have 2 columns - username and password hash.
;auth_query = SELECT usename, passwd FROM pg_shadow WHERE usename=$1

;;;
;;; Users allowed into database 'pgbouncer'
;;;

; comma-separated list of users, who are allowed to change settings
;admin_users = user2, someadmin, otheradmin

; comma-separated list of users who are just allowed to use SHOW command
;stats_users = stats, root

;;;
;;; Pooler personality questions
;;;

; When server connection is released back to pool:
;   session      - after client disconnects
;   transaction  - after transaction finishes
;   statement    - after statement finishes
pool_mode = transaction

;
; Query for cleaning connection immediately after releasing from client.
; No need to put ROLLBACK here, pgbouncer does not reuse connections
; where transaction is left open.
;
; Query for 8.3+:
;   DISCARD ALL;
;
; Older versions:
;   RESET ALL; SET SESSION AUTHORIZATION DEFAULT
;
; Empty if transaction pooling is in use.
;
server_reset_query = DISCARD ALL


; Whether server_reset_query should run in all pooling modes.
; If it is off, server_reset_query is used only for session-pooling.
;server_reset_query_always = 0

;
; Comma-separated list of parameters to ignore when given
; in startup packet.  Newer JDBC versions require the
; extra_float_digits here.
;
;ignore_startup_parameters = extra_float_digits

;
; When taking idle server into use, this query is ran first.
;   SELECT 1
;
;server_check_query = select 1

; If server was used more recently that this many seconds ago,
; skip the check query.  Value 0 may or may not run in immediately.
;server_check_delay = 30

;; Use <appname - host> as application_name on server.
;application_name_add_host = 0

;;;
;;; Connection limits
;;;

; total number of clients that can connect
max_client_conn = 5000

; default pool size.  20 is good number when transaction pooling
; is in use, in session pooling it needs to be the number of
; max clients you want to handle at any moment
default_pool_size = 20

;; Minimum number of server connections to keep in pool.
;min_pool_size = 0

; how many additional connection to allow in case of trouble
;reserve_pool_size = 5

; if a clients needs to wait more than this many seconds, use reserve pool
;reserve_pool_timeout = 3

; how many total connections to a single database to allow from all pools
;max_db_connections = 50
;max_user_connections = 50

; If off, then server connections are reused in LIFO manner
;server_round_robin = 0

;;;
;;; Logging
;;;

;; Syslog settings
;syslog = 0
;syslog_facility = daemon
;syslog_ident = pgbouncer

; log if client connects or server connection is made
;log_connections = 1

; log if and why connection was closed
;log_disconnections = 1

; log error messages pooler sends to clients
;log_pooler_errors = 1

;; Period for writing aggregated stats into log.
;stats_period = 60

;; Logging verbosity.  Same as -v switch on command line.
;verbose=0

;;;
;;; Timeouts
;;;

;; Close server connection if its been connected longer.
;server_lifetime = 1200

;; Close server connection if its not been used in this time.
;; Allows to clean unnecessary connections from pool after peak.
;server_idle_timeout = 60

;; Cancel connection attempt if server does not answer takes longer.
;server_connect_timeout = 15

;; If server login failed (server_connect_timeout or auth failure)
;; then wait this many second.
;server_login_retry = 15

;; Dangerous.  Server connection is closed if query does not return
;; in this time.  Should be used to survive network problems,
;; _not_ as statement_timeout. (default: 0)
;query_timeout = 0

;; Dangerous.  Client connection is closed if the query is not assigned
;; to a server in this time.  Should be used to limit the number of queued
;; queries in case of a database or network failure. (default: 120)
;query_wait_timeout = 120

;; Dangerous.  Client connection is closed if no activity in this time.
;; Should be used to survive network problems. (default: 0)
;client_idle_timeout = 0

;; Disconnect clients who have not managed to log in after connecting
;; in this many seconds.
;client_login_timeout = 60

;; Clean automatically created database entries (via "*") if they
;; stay unused in this many seconds.
; autodb_idle_timeout = 3600

;; How long SUSPEND/-R waits for buffer flush before closing connection.
;suspend_timeout = 10

;; Close connections which are in "IDLE in transaction" state longer than
;; this many seconds.
;idle_transaction_timeout = 0

;;;
;;; Low-level tuning options
;;;

;; buffer for streaming packets
;pkt_buf = 4096

;; man 2 listen
;listen_backlog = 128

;; Max number pkt_buf to process in one event loop.
;sbuf_loopcnt = 5

;; Maximum Postgres protocol packet size.
;max_packet_size = 2147483647

;; networking options, for info: man 7 tcp

;; Linux: notify program about new connection only if there
;; is also data received.  (Seconds to wait.)
;; On Linux the default is 45, on other OS'es 0.
;tcp_defer_accept = 0

;; In-kernel buffer size (Linux default: 4096)
;tcp_socket_buffer = 0

;; whether tcp keepalive should be turned on (0/1)
;tcp_keepalive = 1

;; following options are Linux-specific.
;; they also require tcp_keepalive=1

;; count of keepaliva packets
;tcp_keepcnt = 0

;; how long the connection can be idle,
;; before sending keepalive packets
;tcp_keepidle = 0

;; The time between individual keepalive probes.
;tcp_keepintvl = 0

;; DNS lookup caching time
;dns_max_ttl = 15

;; DNS zone SOA lookup period
;dns_zone_check_period = 0

;; DNS negative result caching time
;dns_nxdomain_ttl = 15

;;;
;;; Random stuff
;;;

;; Hackish security feature.  Helps against SQL-injection - when PQexec is disabled,
;; multi-statement cannot be made.
;disable_pqexec=0

;; Config file to use for next RELOAD/SIGHUP.
;; By default contains config file from command line.
;conffile

;; Win32 service name to register as.  job_name is alias for service_name,
;; used by some Skytools scripts.
;service_name = pgbouncer
;job_name = pgbouncer

;; Read additional config from the /etc/pgbouncer/pgbouncer-other.ini file
;%include /etc/pgbouncer/pgbouncer-other.ini
```

****

## Performance Testing
> Aim is to use a load testing tool to test postgreSQL database setup

### PgBench
> A tool shipped together with postgres. Found in **/usr/pgsql-16/bin** directory

Generate Test Data
```bash
/usr/pgsql-16/bin/pgbench -i -s 100 stressdb -U postgres -p 5432
```
> Use  a scale_factor of 100 to generate data i.e 10M records

Bench mark database
```bash 
/usr/pgsql-16/bin/pgbench -h 127.0.0.1 -p 5000 -c 100 -T 120 stressdb -U postgres
```
> 5000 = database connection port or load balancer binding port, 100 = number of connections 120 - Time in seconds

Bench mark using threads
```bash 
/usr/pgsql-16/bin/pgbench -c 100 -j 2 -T 120  stressdb -U postgres -h 127.0.0.1 -p 5000

/usr/pgsql-16/bin/pgbench -c 100 -t 1000 -S -j 2 -T 60 -C -f readonly.sql stress -U postgres -h 127.0.0.1 -p 5000
```
> 2 = number of threads

Using sql script
> Create a file readonly.sql

Contents of readonly.sql
```sql
select abalance from pgbench_accounts where aid = 1;
select abalance from pgbench_accounts where aid = 1;
select * from pgbench_tellers  where tid = 1;
select * from pgbench_branches where bid = 1;
select tid from pgbench_history where bid =1;
```

Run the bench mark
```bash
/usr/pgsql-16/bin/pgbench -c 100 -j 2 -T 60 -f readonly.sql stress -U postgres -h 127.0.0.1 -p 5000
```

<hr/>

## Postgres Upgrade
> How to upgrade from one version of postgres to another

## CPU, Memory & Storage Metrics
> How to configure pg_stats extension to show CPU, Memory and Storage metrics in PgAdmin4 dashboard

### POSTGRES STATS EXTENSION 
> A postgresql extension that provides system metrics.
> Reference link [here](https://www.snowdba.com/install-system_stats-extenstion-postgres-16-rhel-8/)

```bash 
subscription-manager repos --enable codeready-builder-for-rhel-8-x86_64-rpms
```
```bash 
yum install perl-IPC-Run
```
```bash 
sudo dnf install -y postgresql16-devel
```
```bash 
sudo dnf install redhat-rpm-config
```

> Download the file zip file [here](https://github.com/EnterpriseDB/system_stats/releases) 

```bash 
gunzip system_stats-2.1.tar.gz
```
```bash 
cd system_stats-2.1
PATH="/usr/pgsql-16/bin:$PATH" make USE_PGXS=1
PATH="/usr/pgsql-16/bin:$PATH" make install USE_PGXS=1
```
### Create the extension
> Connect to database using psql and:
```bash 
create extension system_stats;
```
> Refresh PgAdmin4 for changes to reflect

## Good practices

    [https://stackoverflow.com/questions/45782327/org-postgresql-util-psqlexception-error-column-user0-id-does-not-exist-hibe](https://stackoverflow.com/questions/45782327/org-postgresql-util-psqlexception-error-column-user0-id-does-not-exist-hibe)

1. Don't use Upper letters in the name of database, schema, tables or columns in PostgreSQL. Else you should to escape
   this names with quotes, and this can cause Syntax errors, so instead you can use :

       @Table(name="table_name", schema = "schame_name")
       ^^^^^^^^^^             ^^^^^^^^^^^

2. The keyword USER is reserved keyword in PostgreSQL take a look at

   **+----------+-----------+----------+-----------+---------+
   | Key Word |PostgreSQL |SQL:2003 | SQL:1999 | SQL-92 |
   +----------+-----------+----------+-----------+---------+
   | .... .... .... .... .... |
   +----------+-----------+----------+-----------+---------+
   | USER | reserved |reserved | reserved | reserved|**
   +----------+-----------+----------+-----------+---------+

3. The difference between Dto and Entity, its good practice to use Entity in the end of the name of your Entity for
   example
   UserEntity

## Important Links

https://www.postgresqltutorial.com/
[https://postgrescheatsheet.com/#/tables](https://postgrescheatsheet.com/#/tables)
[https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)
https://www.postgresqltutorial.com/postgresql-reset-password/


