# StoredIn

A minimal and barebone pastebin like application developed in NodeJS. Initial plan is to keep it as simple and efficient as possible, barebone, no fancy UI have been planned yet. It is very easy to create a frontend for this application as the standard is set by the backend. Depending on the time I have, I'll think about developing a frontend.

## Launch your own instance

Running your own instance of **StoredIn** is quite easy, for development or for deployment purposes as it uses NodeJS.

### Prerequisites

The software(s) needed to run StoredIn are `nodejs` and `npm`. They provide all the tools necessary to launch your own instance.

- Refer to the [official NodeJS](https://nodejs.org/en/download/) download page to learn how to install `nodejs` and `npm` in your system.
- Change the directory to where the project files are located.
- Install all the necessary packages in `package.json` using `npm install` in the root of the project directory *(through terminal)*.
- Check the `config.js` file located at the root of the project directory and make changes as needed.
- Launch the server using `npm start` or `node app.js` and the server should be available at the port specified in the `config.js` file.

## Usage

Using this for storage is very easy using `curl` but anyone could easily write a tiny `python` script to create pastes. This application was written with the sole purpose of working with terminals.

1. `curl --data "data=$(cat somefile.ext)" https://paste.prashant.me`
2. `cat somefile.ext | curl --data-urlencode data@- https://paste.prashant.me`

In addition, if you can create `alias` in Linux machines, you can create an `alias` as such.

```bash
echo 'alias sim="curl --data-urlencode data@- https://paste.prashant.me"' >> ~/.bash_aliases
```

You might have to source `~/.bash_aliases` in your config file, depending on which shell you use -

1. If you use `zsh`, `echo 'source ~/.bash_aliases' >> ~/.zshrc`
2. If you use plain `bash`, it might already be in there or do the same. `echo 'source ~/.bash_aliases' >> ~/.bashrc`

Once you have the alias set in your config, you can create a paste simply with `cat somefile.ext | sim`.
