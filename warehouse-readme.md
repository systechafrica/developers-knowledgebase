# WAREHOUSE DATABASE 🚀️

A database that houses all the data that we need to create:

1. Schemes
2. Sponsors
3. Members
4. Contributions

**NOTE: **  Fundmaster should NOT be installed in this database. Use queries to extract and export data to your target database

## Extensions

The following extensions need to be installed to make queries lightweight:

1. tsm_system_rows - for quick randomization

   ```sql
   CREATE EXTENSION tsm_system_rows;
   SELECT * FROM my_table TABLESAMPLE SYSTEM_ROWS(100);
   ```
2.

## Tables Warehouse database:

1. schemes_warehouse - Used to create schemes data

   ```sql
   with data as (select c.*
                 from schemes_warehouse c
                          left join schemes s on s.id = c.id
                 order by random() fetch next :rows rows only
   )
   INSERT INTO SCHEMES (ID, ACTIVE, ACT_FACT_MODE, ADMINS_MODE, ALLOW_INVEST_PROF, BEN_CALC_MODE, CONTR_NET_SS_DED,
                        DATE_CLOSED, DEFICIT_TREAT_MODE, EXCESS_ALLOC_MODE, EXCESS_CONTR_DET,
                        HAS_CORP_TRUSTEE, INTRST_RATE_MODE, IRRVC_TRUST, MEMBER_COMPULSORY,
                        MULTICOMP, PENS_SERVICE_MODE, POST_BATCH_IFGTLT_AMOUNT, SCHEME, SCHEMEACTIVE,
                        SCHEME_STATUS, BUILDING, CELL_PHONE, COUNTRY, EMAIL, FAX, FIXED_PHONE, POSTAL_ADDRESS, ROAD,
                        TELEX, TOWN, CONTACT_PERSON,scheme_name,plantype,finyr_start_day)
   select nextval('seq'),'YES', 'FACTOR_BASED', 'MEMBER_LEVEL', 'NO', NULL, NULL, NULL, 'RESERVE_OUTFLOW',
          'EMPLOYEE_PRIORITY', 0, NULL, 'ANNUAL_INTEREST', NULL, NULL, 1, 0, 0, NULL, 0, 'OPEN', d.industry,
          NULL, d.country, d.domain, '', '', d.locality,
          '', NULL, d.locality, d."linkedin url",d.name,'DEFINED_CONTRIBUTION',1
   from data d;
   ```
2. peoplenames - Used to create membership data

   ```sql
   create unique index id_indx on peoplenames using btree (
                                                    id nulls last
       );

   ``` 

   Export to members template:

      ```SQL
         with series as (select *
                      from generate_series(1, 10000000)
                      order by random() fetch next :c rows only)
   
            select case gender
            when null then ''
            when 'MALE' then 'MR'
            when 'FEMALE' then 'MS'
            ELSE '' END    as "TITLE",
            surname            as "SURNAME",
            firstname          as "FIRSTNAME",
            othernames         as "OTHER NAMES",
            ''                 as "MAIDEN NAME",
            gender             as "GENDER",
            (case
            when martl_status = 0 then 'Never Married'
            when martl_status = 1 then 'Married'
            when martl_status = 2 then 'Separated'
            when martl_status = 3 then 'Divorced'
            when martl_status = 4 then 'Widowed'
            when martl_status = 5 then 'Abandoned'
            when martl_status = 6 then 'Not Specified'
            end
            )              as "CURRENT MARITAL STATUS",
            (case
            when martl_status = 0 then 'Never Married'
            when martl_status = 1 then 'Married'
            when martl_status = 2 then 'Separated'
            when martl_status = 3 then 'Divorced'
            when martl_status = 4 then 'Widowed'
            when martl_status = 5 then 'Abandoned'
            when martl_status = 6 then 'Not Specified'
            end
            )              as "MARITAL STATUS AT DOE",
            (:companyCode)     as "COST CENTER",
            (:mclassidCode)    as "MEMBER CLASS",
            idno               as "NATIONAL ID NUMBER",
            'NATIONAL'         as "OTHER IDENTIFICATION TYPES(PASSPORT,VOTER,DRIVER)",
            ''                 as "OTHER ID",
            tpin               as "TPIN",
            dob                as "DOB",
            date_of_employment as "DOEMPLOYMENT",
            ''                 as "DOSCHEME",
            staffno            as "STAFF NUMBER",
            ''                 as "NATIONAL PEN NUMBER",
            ''                 as "MONTHLY SALARY",
            ''                 as "OCCUPATION",
            ''                 as "POSTAL ADDRESS",
            ''                 as "TOWN",
            email              as "EMAIL",
            phone              as "CELL PHONE",
            phone              as "FIXED PHONE",
            ''                 as "OTHER CONTACTS",
            ''                 as "NATIONALITY",
            ''                 as "PLACE OF BIRTH DISTRICT",
            ''                 as "PLACE OF BIRTH TA",
            ''                 as "PLACE OF BIRTH VILLAGE",
            ''                 as "PARMANENT DISTRICT",
            ''                 as "PARMANENT TA",
            ''                 as "PARMANENT VILLAGE",
            ''                 as "BANK",
            ''                 as "BRANCH",
            ''                 as "ACCOUNT NAME",
            ''                 as "ACCOUNT NO",
            ''                 as "SAVINGS CATEGORY",
            ''                 as "NO OF MONTHS",
            ''                 as "DATE SUBSCRIBE",
            ''                 as "LIFESTYLE PRODUCT",
            'NO'               as "ALLOW NOTIFICATION"
         
            from peoplenames
            where id in (select *
            from series);
      ```

3. 