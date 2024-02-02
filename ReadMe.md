
# WELCOME

## Set up
  Clone and enter project folder
  
```bash
 yarn install
```

## Run

```bash
 yarn dev
```

## Errors

````
opensslErrorStack: [ 'error:03000086:digital envelope routines::initialization error' ],
  library: 'digital envelope routines',
  reason: 'unsupported',
  code: 'ERR_OSSL_EVP_UNSUPPORTED'
````
### Solution to Error
Linux
```bash 
  export NODE_OPTIONS=--openssl-legacy-provider
```

Windows
```bash 
  set NODE_OPTIONS=--openssl-legacy-provider
```