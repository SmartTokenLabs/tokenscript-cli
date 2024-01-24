TokenScript CLI
=================

A tool for managing TokenScript projects.

It currently includes commands for creating projects based on a selection of templates, and building the project into a valid TSML.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Usage](#usage)
* [Development](#development)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @tokenscript/cli
$ tokenscript COMMAND
running command...
$ tokenscript (--version)
@tokenscript/cli/1.1.3 linux-x64 node-v16.18.1
$ tokenscript --help [COMMAND]
USAGE
  $ tokenscript COMMAND
...
```
<!-- usagestop -->

# Development

TokenScript CLI isn't yet published as an NPM package, it needs to be installed and built, or run in development mode.

## Development dependencies 

The TokenScript CLI requires libxml2js which in turn requires node-gyp to build. 
This comes bundled with newer versions of npm but may need some dependencies installed depending on your operating system.

Please follow the guide at the [node-gyp GIT repo](https://github.com/nodejs/node-gyp) to ensure that it's working. 

## Use locally

You can run the CLI from source in developer mode like this:
```sh-session
$ git clone https://github.com/TokenScript/tokenscript-cli.git
$ cd tokenscript-cli
$ npm i
$ ./bin/dev
```

You can also install the package globally on your system like this:
```sh-session
$ npm run build
$ npm link
```

Note: Rebuilding will update the global version

## building the typescript project

```shell
$ cd typescript project
typescript-project$ npm i 
typescript-project$ npm run build
```

If all goes well you should see a file in `./out/tokenscript.tsml`

# Commands
<!-- commands -->
* [`tokenscript build`](#tokenscript-build)
* [`tokenscript certificate COMMAND`](#tokenscript-certificate-command)
* [`tokenscript create [DIRECTORY]`](#tokenscript-create-directory)
* [`tokenscript emulate`](#tokenscript-emulate)
* [`tokenscript help [COMMAND]`](#tokenscript-help-command)
* [`tokenscript plugins`](#tokenscript-plugins)
* [`tokenscript plugins:install PLUGIN...`](#tokenscript-pluginsinstall-plugin)
* [`tokenscript plugins:inspect PLUGIN...`](#tokenscript-pluginsinspect-plugin)
* [`tokenscript plugins:install PLUGIN...`](#tokenscript-pluginsinstall-plugin-1)
* [`tokenscript plugins:link PLUGIN`](#tokenscript-pluginslink-plugin)
* [`tokenscript plugins:uninstall PLUGIN...`](#tokenscript-pluginsuninstall-plugin)
* [`tokenscript plugins:uninstall PLUGIN...`](#tokenscript-pluginsuninstall-plugin-1)
* [`tokenscript plugins:uninstall PLUGIN...`](#tokenscript-pluginsuninstall-plugin-2)
* [`tokenscript plugins update`](#tokenscript-plugins-update)
* [`tokenscript refresh`](#tokenscript-refresh)
* [`tokenscript sign`](#tokenscript-sign)
* [`tokenscript validate`](#tokenscript-validate)

## `tokenscript build`

Build the tokenscript project into a .tsml

```
USAGE
  $ tokenscript build

DESCRIPTION
  Build the tokenscript project into a .tsml
```

_See code: [dist/commands/build.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/build.ts)_

## `tokenscript certificate COMMAND`

Create a certificate request or sign an existing request.

```
USAGE
  $ tokenscript certificate [COMMAND] [-k <value>] [-m <value>] [-r <value>] [-r <value>] [-c <value>]

ARGUMENTS
  COMMAND  (request|sign) Whether to create a signing 'request' or 'sign' an existing request

FLAGS
  -c, --cn=<value>                    The CN for the certificate, or issuer CN if signing
  -k, --privateKeyFile=<value>        [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-signing.key] Hex
                                      encoded private key filename (for creating CSR)
  -m, --masterPrivateKeyFile=<value>  [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-master.key] Hex
                                      encoded master private key filename (for signing CSR)
  -r, --certFile=<value>              [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-certificate.pem]
                                      Certificate PEM input or output filename
  -r, --certRequestFile=<value>       [default:
                                      /home/michael/PhpstormProjects/tokenscript-cli/ts-certificate-request.pem]
                                      Certificate signing request PEM input or output filename

DESCRIPTION
  Create a certificate request or sign an existing request.
```

_See code: [dist/commands/certificate.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/certificate.ts)_

## `tokenscript create [DIRECTORY]`

Create a new TokenScript project

```
USAGE
  $ tokenscript create [DIRECTORY] [-t emptySvelte|emptyTypescript|empty] [-h <value>]

FLAGS
  -h, --hardHat=<value>    Directory of HardHat project
  -t, --template=<option>  <options: emptySvelte|emptyTypescript|empty>

DESCRIPTION
  Create a new TokenScript project
```

_See code: [dist/commands/create.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/create.ts)_

## `tokenscript emulate`

Emulate the TokenScript in a browser

```
USAGE
  $ tokenscript emulate [-e <value>]

FLAGS
  -e, --emulatorHost=<value>

DESCRIPTION
  Emulate the TokenScript in a browser
```

_See code: [dist/commands/emulate.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/emulate.ts)_

## `tokenscript help [COMMAND]`

Display help for tokenscript.

```
USAGE
  $ tokenscript help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tokenscript.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.22/src/commands/help.ts)_

## `tokenscript plugins`

List installed plugins.

```
USAGE
  $ tokenscript plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ tokenscript plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `tokenscript plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tokenscript plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ tokenscript plugins add

EXAMPLES
  $ tokenscript plugins:install myplugin 

  $ tokenscript plugins:install https://github.com/someuser/someplugin

  $ tokenscript plugins:install someuser/someplugin
```

## `tokenscript plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ tokenscript plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tokenscript plugins:inspect myplugin
```

## `tokenscript plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ tokenscript plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ tokenscript plugins add

EXAMPLES
  $ tokenscript plugins:install myplugin 

  $ tokenscript plugins:install https://github.com/someuser/someplugin

  $ tokenscript plugins:install someuser/someplugin
```

## `tokenscript plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ tokenscript plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ tokenscript plugins:link myplugin
```

## `tokenscript plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tokenscript plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tokenscript plugins unlink
  $ tokenscript plugins remove
```

## `tokenscript plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tokenscript plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tokenscript plugins unlink
  $ tokenscript plugins remove
```

## `tokenscript plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ tokenscript plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ tokenscript plugins unlink
  $ tokenscript plugins remove
```

## `tokenscript plugins update`

Update installed plugins.

```
USAGE
  $ tokenscript plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

## `tokenscript refresh`

Refresh a HardHat project

```
USAGE
  $ tokenscript refresh

DESCRIPTION
  Refresh a HardHat project
```

_See code: [dist/commands/refresh.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/refresh.ts)_

## `tokenscript sign`

sign the built .tsml

```
USAGE
  $ tokenscript sign [-v] [-k <value>] [-p <value>] [-r <value>]

FLAGS
  -k, --privateKeyFile=<value>  [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-signing.key] Hex encoded
                                private key file location
  -p, --publicKeyFile=<value>   [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-signing.pub] Hex encoded
                                private key file location
  -r, --certFile=<value>        [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-certificate.pem] Certificate
                                PEM filename
  -v, --verify                  Verify existing signed .tsml

DESCRIPTION
  sign the built .tsml
```

_See code: [dist/commands/sign.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/sign.ts)_

## `tokenscript validate`

Validate an existing .tsml

```
USAGE
  $ tokenscript validate

DESCRIPTION
  Validate an existing .tsml
```

_See code: [dist/commands/validate.ts](https://github.com/TokenScript/tokenscript-cli/blob/v1.1.3/dist/commands/validate.ts)_
<!-- commandsstop -->
