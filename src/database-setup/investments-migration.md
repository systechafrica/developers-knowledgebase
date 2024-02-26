## INVESTMENT MIGRATION

> Migrating investments data from one database to another.

**Run queries in primary database and copy results to target database**

<hr/>

1. Identify target scheme to migrate investments into
   ```sql
   -- 759687
   select id, SCHEME_NAME from SCHEMES;
   ```
2. Identify tables with constraints to Investments table
   ```sql
    approvedissuer_id            bigint
        constraint fk9p2asltr26g1x92k3542vwf0t
        references approved_issuers,
    constructor_id               bigint
        constraint fk1kkhu7sinoptawm8agvap9f7u
        references creditor_debtor,
    consultant_id                bigint
        constraint fk3eq28d5m3rhdy0lhwouubo7o1
        references creditor_debtor,
    creditor_id                  bigint
        constraint fkj7vkstdbaaxrq53f8bqrsj06j
        references creditor_debtor,
    currency_id                  bigint
        constraint fkg83pfxlwqqk6nfg4aht5i53ma
        references currencies,
    fundmanager_id               bigint
        constraint fkewl60i237ble0qdl3ikd9jda6
        references fund_managers,
    investmentclass_id           bigint
        constraint fkfftumeaj54hijt6vo90w4spcd
        references investment_class,
    lastintrstbooktxn_id         bigint
        constraint fktjhf08yigap4mtiq44d5mf8lw
        references investment_txns,
    pool_id                      bigint
        constraint fk9a9i6jf6ffj1ice6jv6yld5fh
        references investment_pools,
    scheme_id                    bigint       not null
        constraint fk396ii45fe0sbnl4q5i47fgcnb
        references schemes,
    subclass_id                  bigint
        constraint fkgr63ds4t39fson04386ui5omx
        references investment_subclasses,
    debt_id                      bigint
        constraint fk9vi1ep4thhwu4nejgraedpoih
        references issued_debts,
    loanee_id                    bigint
        constraint fkifkit9duxfkm9no0qlmn3yl87
        references approved_loanee,
    investedcurrency_id          bigint
        constraint fknbll4abei1iorwqshbrgh3lsg
        references currencies,
    listedcompany_id             bigint
        constraint fkn3xrs5fallfjh7ecpu3hkr3h9
        references listed_companies,
    offshoreinvestmentcompany_id bigint
        constraint fk1g5ni6um6dvu19dhi4a9b7ymu
        references offshore_inv_companies,
    currentfdrhistory_id         bigint
        constraint fkqgj4jfsm82u2nkwvy0xfg0mpn
        references fixed_dep_rollover,
    acquiredfrom_id              bigint
        constraint fk8kaod0x2rxw5ppjv1n1315nam
        references property_stakeholders,
    manager_id                   bigint
        constraint fk2r9v3hut2l1pf1s3lgwql6b4i
        references property_managers,
    prepaymentaccount_id         bigint
        constraint fk6ktmvxt7cnx7bwd8sph3ilwjo
        references accounts,
    privateequitycompany_id      bigint
        constraint fks1m7f6xv4k93xmnx89187e82v
        references private_equity_companies
   ```
3. Identify bank and bank branches from target scheme:
   ```sql
       -- 759976
       select * from BANKS;
       -- 759989
       select * from BANK_BRANCHES where BANK_ID=759976;
   ```
4. Start moving data
   ```sql
     --approved_issuers
    select a.id, date_prepared, officer_in_charge, accountname, accountnumber, building, care_of, cell_phone, a.country, depot, email, fax, fixed_phone, latitude, longitude, other_contacts, postal_address, region_addr, residential_address, road, secondary_phone, sub_region, telex, town, agr_with_rba, basis_of_rem, cert_no, code, contact_person, date_of_appoint, date_of_incorp, end_date, income_taxref, levy_freq, manager_in_charge, name, partner_number, percent_invested, pin, professional_body, report_freg, report, signed_agr, start_date, status, tax_ref, termination, value, placeofbirth_id, pmtplaceofbirth_id, pmttraditionalauth_id, pmtvillage_id, regionobject_id, subregionobject_id, traditionalauthority_id, village_id, 759976 as bank_id, 759989 as bankbranch_id, 759687 as scheme_id, secondary_email, issuer_category from approved_issuers a where id in(select approvedissuer_id from investments where scheme_id=1750);

   --creditor_debtor
   select * from creditor_debtor c where id in (select constructor_id from investments i where i.constructor_id=c.id and i.scheme_id=1750) union all select * from creditor_debtor c where id in (select consultant_id from investments i where i.consultant_id=c.id and i.scheme_id=1750) union all select * from creditor_debtor c where id in (select creditor_id from investments i where i.creditor_id=c.id and i.scheme_id=1750);

   --fund_managers
   select f.id, accountname, accountnumber, building, care_of, cell_phone, country, depot, email, fax, fixed_phone, latitude, longitude, other_contacts, postal_address, region_addr, residential_address, road, secondary_phone, sub_region, telex, town, agr_with_rba, enable_notifications, appointmnt_date, basis_of_rem, cert_no, code, contact_person, date_of_incorp, end_date, gf_id, levy_freq, manager_in_charge, name, officer_in_charge, partner_number, percent_invested, pin, professional_body, reference_no, report_freg, report, signed_agr, start_date, status, tax_ref, termination_date, value, placeofbirth_id, pmtplaceofbirth_id, pmttraditionalauth_id, pmtvillage_id, regionobject_id, subregionobject_id, traditionalauthority_id, village_id, 759976 as bank_id, 759989 as bankbranch_id, 759687 as scheme_id, secondary_email from fund_managers f where id in (select distinct fundmanager_id from investments i where i.scheme_id = 1750);

   --investment_class
   select * from investment_class where id in (select distinct investmentclass_id from investments i where i.scheme_id = 1750);

   --investment_txns
   select * from investment_txns where id in (select lastintrstbooktxn_id from investments i where i.scheme_id = 1750);

   --investment_pools
   select * from investment_pools where id in (select distinct pool_id from investments i where i.scheme_id = 1750);

   --investment_subclasses
   select * from investment_subclasses where id in (select distinct subclass_id from investments i where i.scheme_id = 1750);

   --withholdingtax_cat
   select w.id, graduated, name, 759687 as scheme_id from withholdingtax_cat w;

   --aging_analysis_header
   select * from aging_analysis_header;
   --budget_items
   select * from budget_items;
   --cashflows_headers
   select * from cashflows_headers;
   --cashflows_sub_headers
   select * from cashflows_sub_headers;
   --fin_expenditure_headers
   select * from fin_expenditure_headers;
   --cashflows_headers
   select * from cashflows_headers;
   --FINANCIAL_REPORTING_HEADERS
   select f.id, category, descr, header_type, iscurrentassets, name, position, 759687 as scheme_id from financial_reporting_headers f;
   --INCOME_STMT_GROUPS
   select i.id, descr, dontshowgrouptitle, dontshowgrouptotal, dontshowheadertitle, dontshowheadertotal, istaxation, isunitpricedeterminant, justforprevgrpssummation, name, position,759687 as  scheme_id from income_stmt_groups i;

   --FIN_REPORTING_HEADER_DETS
   select * from fin_reporting_header_dets;

   --ACCOUNTS
   select a.id, account_type, active, cf_header, category, code, creditordebtorid, displayonselection, frhdmappingokay, fundbalance_acc, inheritcodefrom, isdefaultchart, issubledger, taxable, lft, legacyname, legacycode, lvl, name, parentid, revalue_acct, rgt, status, transferprevcapitaltomfa, aginganalysisheader_id, budgetitem_id, cashflowheader_id, cashflowsubheader_id, expenditureheader_id, frhd_id, revalacct_id, 759687 as scheme_id,759541 as srccurrency_id, parentnamenative, enforcesubledgers from accounts a WHERE scheme_id=1750 and revalacct_id is not null;
   --ACCOUNTS
   select a.id, account_type, active, cf_header, category, code, creditordebtorid, displayonselection, frhdmappingokay, fundbalance_acc, inheritcodefrom, isdefaultchart, issubledger, taxable, lft, legacyname, legacycode, lvl, name, parentid, revalue_acct, rgt, status, transferprevcapitaltomfa, aginganalysisheader_id, budgetitem_id, cashflowheader_id, cashflowsubheader_id, expenditureheader_id, frhd_id, revalacct_id, 759687 as scheme_id,759541 as srccurrency_id, parentnamenative, enforcesubledgers from accounts a WHERE scheme_id=1750 and revalacct_id is null;

   --WITHHOLDINGTAX_RATES
   with debts as (
   select whtaxrate_id
   from issued_debts
   where id in (select distinct debt_id from investments i where i.scheme_id = 1750)
   )
   select W.ID, EFFECTIVE_DATE, LOCALITY, MIN_AMOUNT, MAX_RATE, MIN_RATE, RATE, TYPE, MAX_AMOUNT, CATEGORY_ID, 759541 AS CURRENCY_ID, EXPENSEACC_ID, PAYABLEACC_ID
   from withholdingtax_rates W
   where id in (select distinct whtaxrate_id from debts);

   --ISSUED_DEBTS
   select i.id, bond_type, coupon_rate, cumulative_cost, currnt_intrstdate, daysinayear, deal_date, descr, dirty_price, face_value, fundmanagercode, handling_fees, redem_date, initial_value, intrst_freq, include_trans_date, intrst_start_dt, interest_type, intnl_ret_rate, category, locality, market_value, maturity_date, name, prev_intrstdate, rebates_comm, redeemed, ref_code, sub_class, settlmnt_date, takeon_val_date, tenor_, valuation_index, issuer_id, 759541 as currency_id, fundmanager_id, 759687 as scheme_id, subclass_id, whtaxrate_id, investmentsubclass from issued_debts i where id in (select distinct debt_id from investments i where i.scheme_id = 1750);

   --APPROVED_LOANEE
   select * from approved_loanee WHERE scheme_id=1750;

   --CURRENCIES
   select * from currencies;

   --LISTED_COMPANIES
   select l.id, category, code, company_type, current_price, description, equity_type, scheme_type, last_valuation_date, name, sector, 759541 as currency_id,759687 as scheme_id from listed_companies l where scheme_id=1750;

   --OFFSHORE_INV_COMPANIES
   select * from offshore_inv_companies;

   --FIXED_DEP_ROLLOVER
   select * from fixed_dep_rollover;

   --PROPERTY_STAKEHOLDERS
   select * from property_stakeholders;

   --PROPERTY_MANAGERS
   select * from property_managers;

   --PRIVATE_EQUITY_COMPANIES
   select p.id, account_name, account_no, building, care_of, cell_phone, country, depot, email, fax, fixed_phone, latitude, longitude, other_contacts, postal_address, region_addr, residential_address, road, secondary_phone, sub_region, telex, town, code, current_price, description, last_valuation_date, name, tax_pin, placeofbirth_id, pmtplaceofbirth_id, pmttraditionalauth_id, pmtvillage_id, regionobject_id, subregionobject_id, traditionalauthority_id, village_id, 759976 as bank_id, 759989 as bankbranch_id, fundmanager_id, 759687 as scheme_id, secondary_email from private_equity_companies p;

   --INVESTMENTS
   select i.investment_type, id, accruedamortization, accruedinterest, accum_amortization, accum_interest_bkd, bond_receipted_interest, ltr_of_agrmnt_status, booking_status, construct_cost, consult_fee, date_of_comm, date_redeemed, deal_date, deleted, descr, lastintrdatebk_init, initial_value, interest_at_redemption, inv_redeemed, investment_category, lastintrdatebook, last_intrcalcdate, last_txn_date, last_value_date, locality, market_value, marketvaluebasecurr, matured, name, price2, quantity, redeemed, redeemed_with_interest, ref_code, roll_over_seq, rollover_type, rolled_over, sold, spot_rate, value_per_share, bghtdate_frmmrk, bond_tpe, cont_note_num, cost_frm_fv, coupon_rate, cumulative_cost, currnt_intrstspaiddate, daysinayear, dirty_price, discount, face_value, handling_fees, redem_date, intrst_freq, intrst_start_dt, interest_type, intnl_ret_rate, lastcoupondatereceipt, maturity_date, medical_levy, open_bal_loaded, prev_intrstspaiddate, rebates_commission, redm_chek_num, redm_recpt_num, sec_market, sub_class, settlmnt_date, takeon_val_date, tenor_, valuation_index, interest_rate, issuer, bght_from_secmrkt, ded_wilng_tax, loan_type, bal_on_principal, current_principal, grace_rate, grace_intr, grace_period, instalment, intr_freq_cur, interest_mode, intr_rate, intr_rate_cur, intr_start_grace, instalment_type, status, repayintr_ingrace, scheduled, exchange_rate, gaurantee_rate, interest_frequency, interest_start_date, scheme_type, weighted_price, include_mat_date_intr, include_txn_date_intr, area, code, date_of_construction, council_rate, country, current_status, developed, lease_end_date, lease_start_date, location, lr_number, origin_cost, property_acquired, area_units, property_code, property_cost_accum, property_status, road, town, unit_cost, equitycategory, commitment_start_date, commitment_stop_date, approvedissuer_id, constructor_id, consultant_id, creditor_id,759541 as currency_id, fundmanager_id, investmentclass_id, lastintrstbooktxn_id, pool_id, 759687 as scheme_id, subclass_id, debt_id, loanee_id, investedcurrency_id, listedcompany_id, offshoreinvestmentcompany_id, currentfdrhistory_id, acquiredfrom_id, manager_id, prepaymentaccount_id, privateequitycompany_id, lockinterestaccrueddate, whtaxrateid, constructorcrdrid, consultantcrdrid, creditordebtorid, investmentsubclass, taxablediscount, acquisitiontxnid, propertytype, countpropertyblocks, countunits, include_accrual_date_intr, countpropertyparking, countpropertysubblocks from investments i where scheme_id=1750;

   ```
5. Randomize the data(If for demo purposes)
