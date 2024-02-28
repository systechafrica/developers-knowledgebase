module.exports = {
    '/': [
        {
            title: 'Getting Started',
            children: [
                '/getting-started/',
            ]
        },
        {
            title: 'Database Setup',
            children: [
                '/database-setup/oracle-guide',
                '/database-setup/edb-postgres-guide',
                '/database-setup/postgres-guide',
                '/database-setup/mysql-guide',
                '/database-setup/triggers',
                '/database-setup/warehouse-readme',
            ]
        },
        {
            title: 'Backups Guide',
            children: [
                '/backups-guide/',
                '/backups-guide/git-backup',
                '/backups-guide/terminal-send-email',
                '/backups-guide/database-backups/databases',
            ]
        },
        {
            title: 'DevSecOps',
            children: [
                '/security/',
                '/security/proactive-control',
                '/security/ssl-reverse-proxy',
                '/security/ssl-letsencrypt',
            ]
        },
        {
            title: 'Pension Domain',
            children: [
                '/pension-domain/',
            ]
        }
    ]
}
