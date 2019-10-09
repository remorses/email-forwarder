# Email forwarder

reads email and forwards email that have a regex in the subject to a webhook

## usage
```yml
version: '3'
services:
    email_verifier:
        image: xmorse/email-forwarder
        environment: 
            - email=
            - password=
            - subject_regex=.*
            - webhook=http://webhook
    webhook:
        build: example_webhook
        # this webhook can for example go to the url in the email to verify email
        # receives the json {
        #     body: '<html>email...<html>',
        #     subject: 'ciao',
        #     to: 'email@sd.it',
        # }
```
