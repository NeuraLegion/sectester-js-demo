# SecTester SDK Demo

## Table of contents

- [About this project](#about-this-project)
- [About SecTester](#about-sectester)
- [About the SDK](#about-the-sdk)
- [Usage](#usage)
  - [Getting a Bright API key](#getting-a-bright-api-key)
  - [Explore the demo application](#explore-the-demo-application)
  - [A full configuration example](#a-full-configuration-example)
  - [Recommended tests](#recommended-tests)
  - [Example of a CI configuration](#example-of-a-ci-configuration)
- [Documentation & Help](#documentation--help)
- [Contributing](#contributing)
- [License](#license)

## About this project

This is a demo project for the SecTester JS SDK framework, with some installation and usage examples. We recommend forking it and playing around, that’s what it’s for!

## About SecTester

Bright is a developer-first Dynamic Application Security Testing (DAST) scanner.

SecTester is a new tool that integrates our enterprise-grade scan engine directly into your unit tests.

With SecTester you can:

- Test every function and component directly
- Run security scans at the speed of unit tests
- Find vulnerabilities with no false positives, before you finalize your Pull Request

Trying out Bright’s SecTester is free 💸, so let’s get started!

> ⚠️ The SecTester project is currently in beta as an early-access tool. We are looking for your feedback to make it the best possible solution for developers, aimed to be used as part of your team’s SDLC. We apologize if not everything will work smoothly from the start, and hope a few bugs or missing features will be no match for you!
>
> Thank you! We appreciate your help and feedback!

## About the SDK

The SDK is designed to provide all the basic tools and functions that will allow you to create the interactions between the Bright scanning engine, run scans on any target and get the results, all in your own console or CI environment.

You can use the SDK command directly, or create a convenient wrapper for your project to integrate security testing directly into your web or testing framework of choice (you can see some examples in the Documentation section)

## Usage

### Getting a Bright API key

1.  Register for a free account at Bright [**signup**](https://app.neuralegion.com/signup)
2.  Create a Bright API key (personal key from your [**UI**](https://docs.brightsec.com/docs/manage-your-personal-account#manage-your-personal-api-keys-authentication-tokens)
3.  Save the Bright API key in your project
    1.  We recommend using your Github repository secrets feature to store the key, accessible via the `Settings > Security > Secrets > Actions` configuration. We use the ENV variable called `BRIGHT_TOKEN` in our examples
    2.  More info on [how to use ENV vars in Github actions](https://docs.github.com/en/actions/learn-github-actions/environment-variables)

### Explore the demo application

First, install the dependencies:

```bash
$ npm ci
```

The whole list of required variables to start the demo application is described in `.env.example` file. The template for this dot env file is available in the root folder.

After that, you can easily create a `.env` file from the template by issuing the following command:

```bash
$ cp .env.example .env
```

Once it is done, just put your previously received API key into the `BRIGHT_TOKEN` variable.

Then you have to build and run services with Docker, issue the command as follows:

```bash
$ docker compose -f docker-compose.yml up -d
```

To initialize DB schema, you should execute a migration, as shown here:

```bash
$ npm run migration:up
```

Finally, perform this command in terminal to run the application:

```bash
$ npm start
```

While having the application running, open a browser and type http://localhost:3000/api and hit enter.
You should see the Swagger UI page for that application that allows you to test the RESTFul CRUD API, like in the following screenshot:

![Swagger UI](https://user-images.githubusercontent.com/38690835/171161124-92e0cc8c-90e1-4168-9242-63c6c598a26d.png)

To explore the Swagger UI:

- Click on the `POST /users` endpoint
- Click on the "Try it out" button
- Click on the blue "Execute" button
- Then you should see a view similar to the following, where you can see the JSON returned from the API:

![Swagger UI](https://user-images.githubusercontent.com/38690835/171161927-0cb03d0b-228c-44e5-aa0e-07653c02e529.png)

Then you can start tests with SecTester against these endpoints as follows:

```bash
$ npm run test:sec
```

> You will find tests written with SecTester in the `./test/sec` folder.

This can take a few minutes, and then you should see the result, like in the following screenshot:

```text
 FAIL  test/sec/users.e2e-spec.ts (453.752 s)
  /users
    POST /
      ✓ should not have XSS (168279 ms)
    GET /:id
      ✕ should not have SQLi (282227 ms)

  ● /users › GET /:id › should not have SQLi

    IssueFound: Target is vulnerable

    Issue in Bright UI:   https://development.playground.neuralegion.com/scans/mKScKCEJRq2nvVkzEHUArB/issues/4rXuWAQTekbJfa9Rc7vHAX
    Name:                 SQL Injection: Blind Boolean Based
    Severity:             High
    Remediation:
    If available, use structured mechanisms that automatically enforce the separation between data and code. These mechanisms may be able to provide the relevant quoting, encoding, and validation automatically, instead of relying on the developer to provide this capability at every point where output is generated. Process SQL queries using prepared statements, parameterized queries, or stored procedures. These features should accept parameters or variables and support strong typing. Do not dynamically construct and execute query strings within these features using 'exec' or similar functionality, since this may re-introduce the possibility of SQL injection
    Details:
    A SQL injection attack consists of insertion or 'injection' of a SQL query via the input data from the client to the application. A successful SQL injection exploit can read sensitive data from the database, modify database data (Insert/Update/Delete), execute administration operations on the database (such as shutdown the DBMS), recover the content of a given file present on the DBMS file system and in some cases issue commands to the operating system. SQL injection attacks are a type of injection attack, in which SQL commands are injected into data-plane input in order to effect the execution of predefined SQL commands, In a BLIND SQLi scenario there is no response data, but the application is still vulnerable via boolean-based (10=10) and other techniques.
    Extra Details:
    ● Injection Points
        Parameter: #1* (URI)
            Type: boolean-based blind
            Title: AND boolean-based blind - WHERE or HAVING clause
            Payload: http://localhost:56774/users/1 AND 2028=2028
        Database Banner: 'postgresql 14.3 on x86_64-pc-linux-musl, compiled by gcc (alpine 11.2.1_git20220219) 11.2.1 20220219, 64-bit'

    References:
    ● https://cwe.mitre.org/data/definitions/89.html
    ● https://www.owasp.org/index.php/Blind_SQL_Injection
    ● https://www.neuralegion.com/blog/blind-sql-injection/
    ● https://kb.neuralegion.com/#/guide/vulnerabilities/32-sql-injection.md

      at SecScan.assert (../packages/runner/src/lib/SecScan.ts:59:13)
          at runMicrotasks (<anonymous>)
      at SecScan.run (../packages/runner/src/lib/SecScan.ts:37:7)
      at Object.<anonymous> (sec/users.e2e-spec.ts:71:7)

Test Suites: 1 failed, 1 total
Tests:       1 failed, 1 passed, 2 total
Snapshots:   0 total
Time:        453.805 s
Ran all test suites matching /test\/sec/i.
```

### A full configuration example

In the following example, we will test the RESTFul CRUD API. [Jest](https://github.com/facebook/jest) is provided as the testing framework, that provides assert functions and test-double utilities that help with mocking, spying, etc.

To start the webserver within the same process with tests, not in a remote environment or container, we use Nest.js [testing utilities](https://docs.nestjs.com/fundamentals/testing#testing-utilities):

```ts
import { UsersModule } from '../../src/users';
import config from '../../src/mikro-orm.config';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroOrmModule } from '@mikro-orm/nestjs';

describe('/users', () => {
  let app!: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule, MikroOrmModule.forRoot(config)]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
});
```

The `@sec-tester/runner` package provides a set of utilities that allows scanning the demo application for vulnerabilities. Let's rewrite the previous example using the built-in `SecRunner` class:

```ts
let runner!: SecRunner;
let app!: INestApplication;

// ...

beforeEach(async () => {
  runner = new SecRunner({ hostname: 'app.neuralegion.com' });

  await runner.init();
});

afterEach(() => runner.clear());
```

To set up a runner, create a `SecRunner` instance passing a configuration as follows:

```ts
import { SecRunner } from '@sec-tester/runner';

const runner = new SecRunner({ hostname: 'app.neuralegion.com' });
```

After that, you have to initialize a `SecRunner` instance:

```ts
await runner.init();
```

The runner is now ready to perform your tests. To start scanning your endpoint, first, you have to create a `SecScan` instance.

Let's verify the `GET /users/:id` endpoint for SQLi:

```ts
describe('GET /:id', () => {
  it('should not have SQLi', async () => {
    const scan = runner.createScan({
      tests: [TestType.SQLI]
    });
  });
});
```

To clarify an attack surface and speed up the test, we suggest making clear where to discover parameters according to the source code.

```ts
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  public findOne(@Param('id') id: number): Promise<User | null> {
    return this.usersService.findOne(id);
  }
}
```

For the example above, it should look like this:

```ts
const scan = runner.createScan({
  tests: [TestType.SQLI],
  attackParamLocations: [AttackParamLocation.PATH]
});
```

Finally, to run a scan against the endpoint, you have to obtain a port to which the server listens. For that, we should adjust a bit the example above:

```ts
let runner!: SecRunner;
let app!: INestApplication;
let baseUrl!: string;

beforeAll(async () => {
  // ...

  const server = app.getHttpServer();

  server.listen(0);

  const port = server.address().port;
  const protocol = app instanceof Server ? 'https' : 'http';
  baseUrl = `${protocol}://localhost:${port}`;
});
```

Now, you can use the `baseUrl` to set up a target:

```ts
await scan.run({
  method: 'GET',
  url: `${baseUrl}/users/1`
});
```

By default, each found issue will cause the scan to stop. To control this behavior you can set a severity threshold using the \`threshold\` method. Since the SQLi is considered to be high severity issue, we can pass `Severity.HIGH` for stricter checks:

```ts
scan.threshold(Severity.HIGH);
```

To avoid long-running test, you can specify a timeout, to say how long to wait before aborting it:

```ts
scan.timeout(300000);
```

To make sure that Jest won't abort tests early, you should align a test timeout with a scan timeout as follows:

```ts
it('should not have SQLi', async () => {
  await runner
    .createScan({
      name: expect.getState().currentTestName,
      tests: [TestType.SQLI],
      attackParamLocations: [AttackParamLocation.PATH]
    })
    .threshold(Severity.MEDIUM)
    .timeout(300000)
    .run({
      method: 'GET',
      url: `${baseUrl}/users/1`
    });
}, 300000);
```

Full documentation can be found in [runner](https://github.com/NeuraLegion/sec-tester-js/tree/master/packages/runner).

### Recommended tests

|                                                                                  |                                                                                                                                              |                              |                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test name**                                                                    | **Description**                                                                                                                              | **Usage in SecTester**       | **Detectable vulnerabilities**                                                                                                                                                                                                                                                                                                                                                                                               |
| **Broken JWT Authentication**                                                    | Tests for secure implementation of JSON Web Token (JWT) in the application                                                                   | `jwt`                        | - [Broken JWT Authentication](https://docs.brightsec.com/docs/broken-jwt-authentication)                                                                                                                                                                                                                                                                                                                                     |
| **Broken SAML Authentication**                                                   | Tests for secure implementation of SAML authentication in the application                                                                    | `broken_saml_auth`           | - [Broken SAML Authentication](https://docs.brightsec.com/docs/broken-saml-authentication)                                                                                                                                                                                                                                                                                                                                   |
| **Brute Force Login**                                                            | Tests for availability of commonly used credentials                                                                                          | `brute_force_login`          | - [Brute Force Login](https://docs.brightsec.com/docs/brute-force-login)                                                                                                                                                                                                                                                                                                                                                     |
| **Business Constraint Bypass**                                                   | Tests if the limitation of number of retrievable items via an API call is configured properly                                                | `business_constraint_bypass` | - [Business Constraint Bypass](https://docs.brightsec.com/docs/business-constraint-bypass)                                                                                                                                                                                                                                                                                                                                   |
| **Client-Side XSS** <br>_(DOM Cross-Site Scripting)_                             | Tests if various application DOM parameters are vulnerable to JavaScript injections                                                          | `dom_xss`                    | - [Reflective Cross-site scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-site scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Common Files Exposure**                                                        | Tests if common files that should not be accessible are accessible                                                                           | `common_files`               | - [Exposed Common File](https://docs.brightsec.com/docs/exposed-common-file)                                                                                                                                                                                                                                                                                                                                                 |
| **Cookie Security Check**                                                        | Tests if the application uses and implements cookies with secure attributes                                                                  | `cookie_security`            | - [Sensitive Cookie in HTTPS Session Without Secure Attribute](https://docs.brightsec.com/docs/sensitive-cookie-in-https-session-without-secure-attribute)<br> <br> - [Sensitive Cookie Without HttpOnly Flag](https://docs.brightsec.com/docs/sensitive-cookie-without-httponly-flag)<br> <br>- [Sensitive Cookie Weak Session ID](https://docs.brightsec.com/docs/sensitive-cookie-weak-session-id)                        |
| **Cross-Site Request Forgery (CSRF)**                                            | Tests application forms for vulnerable cross-site filling and submitting                                                                     | `csrf`                       | - [Unauthorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/unauthorized-cross-site-request-forgery-csrf)<br> <br> - [Authorized Cross-Site Request Forgery (CSRF)](https://docs.brightsec.com/docs/authorized-cross-site-request-forgery-csrf)                                                                                                                                                       |
| **Cross-Site Scripting (XSS)**                                                   | Tests if various application parameters are vulnerable to JavaScript injections                                                              | `xss`                        | - [Reflective Cross-Site Scripting (rXSS)](https://docs.brightsec.com/docs/reflective-cross-site-scripting-rxss)<br> <br> - [Persistent Cross-Site Scripting (pXSS)](https://docs.brightsec.com/docs/persistent-cross-site-scripting-pxss)                                                                                                                                                                                   |
| **Default Login Location**                                                       | Tests if login form location in the target application is easy to guess and accessible                                                       | `default_login_location`     | - [Default Login Location](https://docs.brightsec.com/docs/default-login-location)                                                                                                                                                                                                                                                                                                                                           |
| **Directory Listing**                                                            | Tests if server-side directory listing is possible                                                                                           | `directory_listing`          | - [Directory Listing](https://docs.brightsec.com/docs/directory-listing)                                                                                                                                                                                                                                                                                                                                                     |
| **Email Header Injection**                                                       | Tests if it is possible to send emails to other addresses through the target application mailing server, which can lead to spam and phishing | `email_injection`            | - [Email Header Injection](https://docs.brightsec.com/docs/email-header-injection)                                                                                                                                                                                                                                                                                                                                           |
| **Exposed AWS S3 Buckets Details** <br>_(Open Buckets)_                          | Tests if exposed AWS S3 links lead to anonymous read access to the bucket                                                                    | `open_buckets`               | - [Exposed AWS S3 Buckets Details](https://docs.brightsec.com/docs/open-bucket)                                                                                                                                                                                                                                                                                                                                              |
| **Exposed Database Details** <br>_(Open Database)_                               | Tests if exposed database connection strings are open to public connections                                                                  | `open_buckets`               | - [Exposed Database Details](https://docs.brightsec.com/docs/open-database)<br> <br> - [Exposed Database Connection String](https://docs.brightsec.com/docs/exposed-database-connection-string)                                                                                                                                                                                                                              |
| **Full Path Disclosure (FPD)**                                                   | Tests if various application parameters are vulnerable to exposure of errors that include full webroot path                                  | `full_path_disclosure`       | - [Full Path Disclosure](https://docs.brightsec.com/docs/full-path-disclosure)                                                                                                                                                                                                                                                                                                                                               |
| **Headers Security Check**                                                       | Tests for proper Security Headers configuration                                                                                              | `header_security`            | - [Misconfigured Security Headers](https://docs.brightsec.com/docs/misconfigured-security-headers)<br> <br> - [Missing Security Headers](https://docs.brightsec.com/docs/missing-security-headers)<br> <br>- [Insecure Content Secure Policy Configuration](https://docs.brightsec.com/docs/insecure-content-secure-policy-configuration)                                                                                    |
| **HTML Injection**                                                               | Tests if various application parameters are vulnerable to HTML injection                                                                     | `html_injection`             | - [HTML Injection](https://docs.brightsec.com/docs/html-injection)                                                                                                                                                                                                                                                                                                                                                           |
| **Improper Assets Management**                                                   | Tests if older or development versions of API endpoints are exposed and can be used to get unauthorized access to data and privileges        | `improper_asset_management`  | - [Improper Assets Management](https://docs.brightsec.com/docs/improper-assets-management)                                                                                                                                                                                                                                                                                                                                   |
| **Insecure HTTP Method** <br>_(HTTP Method Fuzzer)_                              | Tests enumeration of possible HTTP methods for vulnerabilities                                                                               | `http_method_fuzzing`        | - [Insecure HTTP Method](https://docs.brightsec.com/docs/insecure-http-method)                                                                                                                                                                                                                                                                                                                                               |
| **Insecure TLS Configuration**                                                   | Tests SSL/TLS ciphers and configurations for vulnerabilities                                                                                 | `insecure_tls_configuration` | - [Insecure TLS Configuration](https://docs.brightsec.com/docs/insecure-tls-configuration)                                                                                                                                                                                                                                                                                                                                   |
| **Known JavaScript Vulnerabilities** <br>_(JavaScript Vulnerabilities Scanning)_ | Tests for known JavaScript component vulnerabilities                                                                                         | `retire_js`                  | - [JavaScript Component with Known Vulnerabilities](https://docs.brightsec.com/docs/javascript-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                         |
| **Known WordPress Vulnerabilities** <br>_(WordPress Scan)_                       | Tests for known WordPress vulnerabilities and tries to enumerate a list of users                                                             | `wordpress`                  | - [WordPress Component with Known Vulnerabilities](https://docs.brightsec.com/docs/wordpress-component-with-known-vulnerabilities)                                                                                                                                                                                                                                                                                           |
| **LDAP Injection**                                                               | Tests if various application parameters are vulnerable to unauthorized LDAP access                                                           | `ldapi`                      | - [LDAP Injection](https://docs.brightsec.com/docs/ldap-injection)<br> <br> - [LDAP Error](https://docs.brightsec.com/docs/ldap-error)                                                                                                                                                                                                                                                                                       |
| **Local File Inclusion (LFI)**                                                   | Tests if various application parameters are vulnerable to loading of unauthorized local system resources                                     | `lfi`                        | - [Local File Inclusion (LFI)](https://docs.brightsec.com/docs/local-file-inclusion-lfi)                                                                                                                                                                                                                                                                                                                                     |
| **Mass Assignment**                                                              | Tests if it is possible to create requests with additional parameters to gain privilege escalation                                           | `mass_assignment`            | - [Mass Assignment](https://docs.brightsec.com/docs/mass-assignment)                                                                                                                                                                                                                                                                                                                                                         |
| **OS Command Injection**                                                         | Tests if various application parameters are vulnerable to Operation System (OS) commands injection                                           | `osi`                        | - [OS Command Injection](https://docs.brightsec.com/docs/os-command-injection)                                                                                                                                                                                                                                                                                                                                               |
| **Prototype Pollution**                                                          | Tests if it is possible to inject properties into existing JavaScript objects                                                                | `proto_pollution`            | - [Prototype Pollution](https://docs.brightsec.com/docs/prototype-pollution)                                                                                                                                                                                                                                                                                                                                                 |
| **Remote File Inclusion (RFI)**                                                  | Tests if various application parameters are vulnerable to loading of unauthorized remote system resources                                    | `rfi`                        | - [Remote File Inclusion (RFI)](https://docs.brightsec.com/docs/remote-file-inclusion-rfi)                                                                                                                                                                                                                                                                                                                                   |
| **Secret Tokens Leak**                                                           | Tests for exposure of secret API tokens or keys in the target application                                                                    | `secret_tokens`              | - [Secret Tokens Leak](https://docs.brightsec.com/docs/secret-tokens-leak)                                                                                                                                                                                                                                                                                                                                                   |
| **Server Side Template Injection (SSTI)**                                        | Tests if various application parameters are vulnerable to server-side code execution                                                         | `ssti`                       | - [Server Side Template Injection (SSTI)](https://docs.brightsec.com/docs/server-side-template-injection-ssti)                                                                                                                                                                                                                                                                                                               |
| **Server Side Request Forgery (SSRF)**                                           | Tests if various application parameters are vulnerable to internal resources access                                                          | `ssrf`                       | - [Server Side Request Forgery (SSRF)](https://docs.brightsec.com/docs/server-side-request-forgery-ssrf)                                                                                                                                                                                                                                                                                                                     |
| **SQL Injection (SQLI)**                                                         | SQL Injection tests vulnerable parameters for SQL database access                                                                            | `sqli`                       | - [SQL Injection: Blind Boolean Based](https://docs.brightsec.com/docs/sql-injection-blind-boolean-based)<br> <br> - [SQL Injection: Blind Time Based](https://docs.brightsec.com/docs/sql-injection-blind-time-based)<br> <br> - [SQL Injection](https://docs.brightsec.com/docs/sql-injection)<br> <br> - [SQL Database Error Message in Response](https://docs.brightsec.com/docs/sql-database-error-message-in-response) |
| **Unrestricted File Upload**                                                     | Tests if file upload mechanisms are validated properly and denies upload of malicious content                                                | `file_upload`                | - [Unrestricted File Upload](https://docs.brightsec.com/docs/unrestricted-file-upload)                                                                                                                                                                                                                                                                                                                                       |
| **Unsafe Date Range** <br>_(Date Manipulation)_                                  | Tests if date ranges are set and validated properly                                                                                          | `date_manipulation`          | - [Unsafe Date Range](https://docs.brightsec.com/docs/unsafe-date-range)                                                                                                                                                                                                                                                                                                                                                     |
| **Unsafe Redirect** <br>_(Unvalidated Redirect)_                                 | Tests if various application parameters are vulnerable to injection of a malicious link which can redirect a user without validation         | `unvalidated_redirect`       | - [Unsafe Redirect](https://docs.brightsec.com/docs/unsafe-redirect)                                                                                                                                                                                                                                                                                                                                                         |
| **User ID Enumeration**                                                          | Tests if it is possible to collect valid user ID data by interacting with the target application                                             | `id_enumeration`             | - [Enumerable Integer-Based ID](https://docs.brightsec.com/docs/enumerable-integer-based-id)                                                                                                                                                                                                                                                                                                                                 |
| **Version Control System Data Leak**                                             | Tests if it is possible to access Version Control System (VCS) resources                                                                     | `version_control_systems`    | - [Version Control System Data Leak](https://docs.brightsec.com/docs/version-control-system-data-leak)                                                                                                                                                                                                                                                                                                                       |
| **XML External Entity Injection**                                                | Tests if various XML parameters are vulnerable to XML parsing of unauthorized external entities                                              | `xxe`                        | - [XML External Entity Injection](https://docs.brightsec.com/docs/xml-external-entity-injection)                                                                                                                                                                                                                                                                                                                             |

### Example of a CI configuration

You can integrate this library into any CI you use, for that you will need to add the `BRIGHT_TOKEN` ENV vars to your CI. Then add the following to your `github actions` configuration:

```yaml
steps:
  - name: Run sec tests
    run: npm run test:sec -- --testTimeout 300000
    env:
      POSTGRES_PASSWORD: ${{ secrets.POSTGRES_PASSWORD }}
      POSTGRES_USER: ${{ secrets.POSTGRES_USER }}
      BRIGHT_TOKEN: ${{ secrets.BRIGHT_TOKEN }}
```

For a full list of CI configuration examples, check out the docs below.

## Documentation & Help

- Full documentation available at: [https://docs.brightsec.com/](https://docs.brightsec.com/)
- Join our [Discord channel](https://discord.gg/jy9BB7twtG) and ask anything!

## Contributing

Please read [contributing guidelines here](./CONTRIBUTING.md).

<a href="https://github.com/NeuraLegion/sectester-js-demo/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NeuraLegion/sectester-js-demo"/>
</a>

## License

Copyright © 2022 [Bright Security](https://brightsec.com/).

This project is licensed under the MIT License - see the [LICENSE file](LICENSE) for details.
