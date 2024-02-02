# Track Database Table Changes

```` 
 Aim is to track changes to certain tables in database level not through application for purposes of accountability
````

## CREATE SCHEMA

Connect as administrator and :
```sql
    create schema logs;
```

Create table for tracking our logs:

```sql
    CREATE TABLE logs.fm_log
    (
        log_id      SERIAL PRIMARY KEY,
        table_name  VARCHAR(255),
        record_id   INT, -- Assuming your table has an integer primary key
        user_id     varchar, -- Assuming you have a user_id in your system
        old_data    JSONB,
        new_data    JSONB,
        update_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
```
Create a function to write the logs to table

```sql
    CREATE OR REPLACE FUNCTION write_table_logs()
        RETURNS TRIGGER AS
    $$
    BEGIN
        INSERT INTO logs.fm_log(table_name, record_id, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME,
                OLD.id, -- Assuming 'id' is your primary key
                   -- Replace 'user_id' with the actual user identifier in your system
                CURRENT_USER,
                ROW_TO_JSON(OLD),
                ROW_TO_JSON(NEW));
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
```


Create triggers to monitor the tables in question

```sql

    CREATE TRIGGER members_logs_trigger
        AFTER INSERT OR UPDATE OR DELETE
        ON public.members
        FOR EACH ROW
    EXECUTE FUNCTION logs.write_table_logs();
    
    CREATE TRIGGER members_bios_logs_trigger
        AFTER INSERT OR UPDATE OR DELETE
        ON public.members_bios
        FOR EACH ROW
    EXECUTE FUNCTION logs.write_table_logs();
    
    CREATE TRIGGER contributions_trigger
        AFTER INSERT OR UPDATE OR DELETE
        ON public.contributions
        FOR EACH ROW
    EXECUTE FUNCTION logs.write_table_logs();
    
    CREATE TRIGGER closing_balances_trigger
        AFTER INSERT OR UPDATE OR DELETE
        ON public.closing_balances
        FOR EACH ROW
    EXECUTE FUNCTION logs.write_table_logs();
```

