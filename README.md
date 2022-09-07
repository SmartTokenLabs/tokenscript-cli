TokenScript CLI
=================

A tool for managing TokenScript projects.

It currently includes commands for creating projects based on a selection of templates, and building the project into a valid TSML.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @tokenscript/cli
$ tokenscript COMMAND
running command...
$ tokenscript (--version)
@tokenscript/cli/0.0.0 linux-x64 node-v16.6.2
$ tokenscript --help [COMMAND]
USAGE
  $ tokenscript COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`tokenscript build`](#tokenscript-build)
* [`tokenscript create [DIRECTORY]`](#tokenscript-create-directory)
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

## `tokenscript build`

Build the tokenscript project into a .tsml

```
USAGE
  $ tokenscript build

DESCRIPTION
  Build the tokenscript project into a .tsml
```

_See code: [dist/commands/build.ts](https://github.com/TokenScript/tokenscript-cli/blob/v0.0.0/dist/commands/build.ts)_

## `tokenscript create [DIRECTORY]`

Create a new TokenScript project

```
USAGE
  $ tokenscript create [DIRECTORY] [-t empty|entryToken]

FLAGS
  -t, --template=<option>  <options: empty|entryToken>

DESCRIPTION
  Create a new TokenScript project
```

_See code: [dist/commands/create.ts](https://github.com/TokenScript/tokenscript-cli/blob/v0.0.0/dist/commands/create.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

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
<!-- commandsstop -->
