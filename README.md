TokenScript CLI
=================

TokenScript CLI is tool for managing TokenScript projects.

The CLI currently includes commands for:
- Creating/initializing projects based on a set of inbuilt templates or contract ABIs
- Building the project into a TSML and validating the output
- Emulating a TokenScript in the browser with live reload
- Signing & validating TokenScripts for distribution

Note: ABI import support is experimental and only works for one template

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Installation & Usage](#installation--usage)
* [Development](#development)
* [Commands](#commands)
<!-- tocstop -->
# Installation & Usage
<!-- usage -->
```sh-session
$ npm install -g @tokenscript/cli
$ tokenscript COMMAND
running command...
$ tokenscript (--version)
@tokenscript/cli/1.2.4 linux-x64 node-v18.18.2
$ tokenscript --help [COMMAND]
USAGE
  $ tokenscript COMMAND
...
```
<!-- usagestop -->

## Creating a TokenScript project

```shell
$ tokenscript create my-project-dir
```

When executing this command you will be asked a series of questions according to the template you selected.
It is recommended to use the Svelte or typescript template to benefit from type checking, including for [Card SDK](https://github.com/SmartTokenLabs/tokenscript-engine/tree/master/javascript/card-sdk) types.

Once the project is successfully initialized you can build or emulate the project:

```shell
$ cd my-project-dir
my-project-dir$ npm run build
```

If all goes well you should see a file in `./out/tokenscript.tsml`

```shell
my-project-dir$ npm run emulate
```

Your browser will open TokenScript viewer and load your project.
You can make changes to your project and the CLI will rebuild & reload as you code.

# Development

The CLI is built using [oclif](https://oclif.io/).

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

## Framework requirements

TokenScript is compatible with almost any frontend framework. Currently only Svelte template is available but React is coming soon. 
The only requirement is that the builder/bundler is capable of exporting to a deterministic set of files that can be referenced for inclusion within tokenscript.xml. 

It is recommended to export as a single page application and rely on document.location.hash for routing. 

Please get in touch with us if you need assistance creating your own templates. 

# Commands
<!-- commands -->
* [`tokenscript build [ENVIRONMENT]`](#tokenscript-build-environment)
* [`tokenscript certificate COMMAND`](#tokenscript-certificate-command)
* [`tokenscript create [DIRECTORY]`](#tokenscript-create-directory)
* [`tokenscript emulate [ENVIRONMENT]`](#tokenscript-emulate-environment)
* [`tokenscript help [COMMANDS]`](#tokenscript-help-commands)
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

## `tokenscript build [ENVIRONMENT]`

Build the tokenscript project into a .tsml

```
USAGE
  $ tokenscript build [ENVIRONMENT] [-t]

ARGUMENTS
  ENVIRONMENT  [default: default] The environment configuration to use for the build

FLAGS
  -t, --outputTemplate  Output a .tsml template that can be used to serve TokenScripts on-the-fly for multiple contracts

DESCRIPTION
  Build the tokenscript project into a .tsml
```

_See code: [src/commands/build.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/build.ts)_

## `tokenscript certificate COMMAND`

Create a certificate request or sign an existing request.

```
USAGE
  $ tokenscript certificate COMMAND [-k <value>] [-m <value>] [-r <value>] [-r <value>] [-c <value>]

ARGUMENTS
  COMMAND  (request|sign) Whether to create a signing 'request' or 'sign' an existing request

FLAGS
  -c, --cn=<value>                    The CN for the certificate, or issuer CN if signing
  -k, --privateKeyFile=<value>        [default: ts-signing.key] Hex encoded private key filename (for creating CSR)
  -m, --masterPrivateKeyFile=<value>  [default: ts-master.key] Hex encoded master private key filename (for signing CSR)
  -r, --certFile=<value>              [default: ts-certificate.pem] Certificate PEM input or output filename
  -r, --certRequestFile=<value>       [default: ts-certificate-request.pem] Certificate signing request PEM input or
                                      output filename

DESCRIPTION
  Create a certificate request or sign an existing request.
```

_See code: [src/commands/certificate.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/certificate.ts)_

## `tokenscript create [DIRECTORY]`

Create a new TokenScript project

```
USAGE
  $ tokenscript create [DIRECTORY] [-t emptySvelte|emptyReact|emptyTypescript|empty] [-h <value>]

FLAGS
  -h, --hardHat=<value>    Directory of HardHat project
  -t, --template=<option>  <options: emptySvelte|emptyReact|emptyTypescript|empty>

DESCRIPTION
  Create a new TokenScript project
```

_See code: [src/commands/create.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/create.ts)_

## `tokenscript emulate [ENVIRONMENT]`

Emulate the TokenScript in a browser

```
USAGE
  $ tokenscript emulate [ENVIRONMENT] [-e <value>]

ARGUMENTS
  ENVIRONMENT  [default: default] The environment configuration to use for the build

FLAGS
  -e, --emulatorHost=<value>

DESCRIPTION
  Emulate the TokenScript in a browser
```

_See code: [src/commands/emulate.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/emulate.ts)_

## `tokenscript help [COMMANDS]`

Display help for tokenscript.

```
USAGE
  $ tokenscript help [COMMANDS] [-n]

ARGUMENTS
  COMMANDS  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for tokenscript.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.2.20/src/commands/help.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/index.ts)_

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

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ tokenscript plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/inspect.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/install.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/link.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/uninstall.ts)_

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

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.4.7/src/commands/plugins/update.ts)_

## `tokenscript refresh`

Refresh a HardHat project

```
USAGE
  $ tokenscript refresh

DESCRIPTION
  Refresh a HardHat project
```

_See code: [src/commands/refresh.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/refresh.ts)_

## `tokenscript sign`

sign the built .tsml

```
USAGE
  $ tokenscript sign [-v] [-k <value>] [-p <value>] [-r <value>]

FLAGS
  -k, --privateKeyFile=<value>  [default: ts-signing.key] Hex encoded private key file location
  -p, --publicKeyFile=<value>   [default: ts-signing.pub] Hex encoded private key file location
  -r, --certFile=<value>        [default: /home/michael/PhpstormProjects/tokenscript-cli/ts-certificate.pem] Certificate
                                PEM filename
  -v, --verify                  Verify existing signed .tsml

DESCRIPTION
  sign the built .tsml
```

_See code: [src/commands/sign.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/sign.ts)_

## `tokenscript validate`

Validate an existing .tsml

```
USAGE
  $ tokenscript validate

DESCRIPTION
  Validate an existing .tsml
```

_See code: [src/commands/validate.ts](https://github.com/SmartTokenLabs/tokenscript-cli/blob/v1.2.4/src/commands/validate.ts)_
<!-- commandsstop -->
