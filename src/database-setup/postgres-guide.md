
# ORACLE - POSTGRES MIGRATION

## TARGET

````
To have Fundmaster XE run on PostgreSQL Database 
````

## WHY

````
    1.Cost: Oracle license costs, using Oracle databases incurs additional costs for features like partitioning and high availability, and expenses can add up quickly. Open-source PostgreSQL is free to install and use.
    2.Flexibility: PostgreSQL has open-source licensing and is easily available from public cloud providers, including AWS. With PostgreSQL, you’re not at risk of vendor lock-in.
    3.Customizability: Because PostgreSQL is open-source, there are countless extensions and add-ons that can improve database performance markedly, and many of them are free to use. With Oracle, similar features quickly add up in cost.
  SOURCE: https://www.enterprisedb.com/blog/the-complete-oracle-to-postgresql-migration-guide-tutorial-move-convert-database-oracle-alternative
````

#### DO WE NEED ORACLE DATABASE TO POSTGRES DATABASE MIGRATION

````
NO. With JPA/HIBERNATE technology, On Installation Fundmaster XE generates tables from entities.
````

## Conversion Process

```
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

### PROCESS

- [x] Set up PostgresSQL Database
- [x] Set up data sources and persistence
- [x] Make initial XE deployment
- [x] Fix the models/entities
- [x] Redeploy
- [ ] Migrate Views & Routines
- [ ] Migrate Native Queries
- [x] Data Migration, From Oracle cloud to postgres db
- [ ] Testing

### WEBAPP FOLDER

~~~~
-user_doc
-WEB-INF
-XiManual
-backup.txt
template_instructions.txt
~~~~

# CHANGES MADE IN CODE

## MUST HAVE SCHEMAS

````
aws_oracle_context
aws_oracle_data
aws_oracle_ext
pg_catalog
````

## IMPORTANT SCRIPTS

## MODELS

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

## NATIVE QUERIES

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

### hibernate sequence

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

### Lob

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

### List all procedures

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

## POSTGRES LOGIN USER

~~~bash
psql -U posgres
pwd [postgres]
psql -V psql [ psql (PostgreSQL) 12.6 ]
~~~

## IMPORT DB

~~~bash
pg_restore -U postgres --dbname=fm --create --verbose c:\pgbackup\fm.tar
~~~

## RUN SQL

~~~bash
#LOGIN TO PSQL
\i path_to_sql_file
~~~

# IMPORT MILLION RECORDS FASTER

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

# SPLIT DELIMITED STRING

~~~postgresql
select unnest(string_to_array('1,2,3,4,5', ',')) as id;
--or
SELECT regexp_split_to_table('1,2,3,4,5', ',') AS ID;
--https://medium.com/swlh/three-routes-convert-comma-separated-column-to-rows-c17c85079ecf
~~~

## DROP ALL VIEWS SQL

~~~sql
SELECT 'DROP VIEW ' || (table_name) || ' cascade;'
FROM information_schema.views
WHERE table_schema IN ('public');
--copy and save to file and execute
~~~

## show ALL tables in schema SQL

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

#### IMPORTANT SCRIPTS

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

# INSTALLING AN EXTENSION

~~~
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

#### IMPORTANT SCRIPTS

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

#### ALTER TABLE COLUMNS

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

<hr/>

# RESET DB NOTIFICATIONS

~~~SQL
update MEMBERS_BIOS set EMAIL=null;
update USERS set EMAIL=null;
update SPONSORS
set EMAIL=null;
update PRINCIPAL_OFFICERS
set EMAIL = null;
update BENEFICIARIES
set EMAIL =null;
delete
from mails;
Update minors
set email = null;
delete
from smslist_conf;
delete
from smses;
~~~

<hr/>

# BACKUP

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

Favourite Commands

~~~bash
-- Fast
pg_dump -U postgres -j 10 -F d -f ./nassitdb$(date +%Y%m%d%H%M%S) nassitdb -v
pg_restore -U postgres -j 8 -d nassitdb ./nassitdb$(date +%Y%m%d%H%M%S) -v

-- Slower
pg_dump -U postgres -v -Fc nassitdb | split -b 5G - nassitdb$(date +%Y%m%d%H%M%S)
pg_restore -U postgres -j 8 -d nassitdb nassitdump -v
~~~

Remote Connection

~~~bash
psql -h 3.7.212.215 -p 5432 -d fundmaster -U postgres -W 
~~~

<hr/>

# STREAMING REPLICATION v14

<hr/>

We need 2 servers i.e Master & Slave.

### 1. MASTER SERVER

Create Replication user

```sql
 CREATE ROLE replicator WITH LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT REPLICATION CONNECTION LIMIT -1 PASSWORD 'Qwerty123';
```

Edit <span style="color:yellow"><i>postgresql.conf</i></span>
<blockquote>
  wal_level = replica <br>
  max_wal_senders = 100
</blockquote>
  Edit <span style="color:yellow"><i>pg_hba.conf</i></span>
<blockquote>
  host replication all <span style="color:deepskyblue">slave_ip_address/32 </span> trust <br>
  host replication replicator <span style="color:deepskyblue">slave_ip_address/32 </span> trust
</blockquote>
Restart the postgres service.

### 2. SLAVE SERVER

<blockquote>
Create a directory. <br>
  <code>
    mkdir /app/postgresql/pgdatabase/data
  </code> <br> 
</blockquote>
<blockquote> 
Now transfer data from master to slave.  <br>
 <code>
 pg_basebackup -h <span style="color:yellow">master_ip</span> -U replicator -D /app/postgresql/pgdatabase/data --write-recovery-conf --progress --verbose
 </code>
</blockquote>
<blockquote> 
Assign the postgres owner of all migrated directories  <br>
 <code>
  chmod -R 0700 /app/postgresql/pgdatabase/data 
</code>
</blockquote>
<blockquote> 
Launching a replica and checking the replication status.  <br/>
 <code>pg_ctl start /app/postgresql/pgdatabase/data</code> <br/>
How to stop stop
 <code>pg_ctl -D /var/lib/pgsql/9.6/data -m immediate stop</code> <br/>

If error change permissions as below
</blockquote>
<blockquote> 
Change directory user and group.  <br/>
 <code>
  chown <span style="color:deepskyblue">user</span> <span style="color:#77bc71">/var/run/folderName</span>
 </code>
 <code>  
  chgrp <span style="color:deepskyblue">user</span> <span style="color:#77bc71">/var/run/folderName</span>
</code>
</blockquote>

### CONFIRM
On the Master Server run :
````sql
select application_name, state, sent_lsn, write_lsn,  sync_state from pg_stat_replication;
````

<hr/>

# Good practices

    [https://stackoverflow.com/questions/45782327/org-postgresql-util-psqlexception-error-column-user0-id-does-not-exist-hibe](https://stackoverflow.com/questions/45782327/org-postgresql-util-psqlexception-error-column-user0-id-does-not-exist-hibe)

1 Don't use Upper letters in the name of database, schema, tables or columns in PostgreSQL. Else you should to escape
this names with quotes, and this can cause Syntax errors, so instead you can use :

        @Table(name="table_name", schema = "schame_name")
        ^^^^^^^^^^             ^^^^^^^^^^^

2 the keyword USER is reserved keyword in PostgreSQL take a look at

    **+----------+-----------+----------+-----------+---------+
    | Key Word |PostgreSQL |SQL:2003  | SQL:1999  | SQL-92  |
    +----------+-----------+----------+-----------+---------+
    |  ....        ....       ....       ....       ....    |
    +----------+-----------+----------+-----------+---------+
    | USER     |  reserved |reserved  | reserved  | reserved|**
    +----------+-----------+----------+-----------+---------+

3 To difference between Dto and Entity its good practice to use Entity in the end of the name of your Entity for example
UserEntity

# IMPORTANT LINKS

https://www.postgresqltutorial.com/
[https://postgrescheatsheet.com/#/tables](https://postgrescheatsheet.com/#/tables)
[https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e](https://medium.com/coding-blocks/creating-user-database-and-adding-access-on-postgresql-8bfcd2f4a91e)
https://www.postgresqltutorial.com/postgresql-reset-password/


