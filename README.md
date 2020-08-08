# StoredIn

A pastebin backend developed in NodeJS. Initial plan is to keep it as simple and efficient as possible, barebone, no fancy UI have been planned yet. It is very easy to create a frontend for this application as the standard is set by the backend. Depending on the time I have, I'll think about developing a frontend.

## Usage

Using the for storage is very easy using `curl` but anyone could easily write a tiny `python` script to create pastes. This application was written solely with the purpose of working with non-GUI window managers (in terminal).

1. `curl --data "data=$(cat somefile.ext)" https://storedin.me`
2. `cat somefile.ext | curl --data-urlencode data@- https://storedin.me`

In addition, if you can create `alias` in Linux machines, I'm an avid Linux user therefore, I lack complexh Windows knowledge. You can create an `alias` as such.

```bash
echo 'alias sim="curl --data-urlencode data@- https://storedin.me"' >> ~/.bash_aliases
```

You might have to source `~/.bash_aliases` in your config file, depending on which shell you use -

1. If you use `zsh`, `echo 'source ~/.bash_aliases' >> ~/.zshrc`
2. If you use plain `bash`, it might already be in there or do the same. `echo 'source ~/.bash_aliases' >> ~/.bashrc`

## Sending Requests

#### POST

1. `/` accepts `data` parameter with **3mb** worth of text contents.

#### GET

1. `/` returns the main page as no parameters are provided.
2. `/id` validates and returns the paste identified by the `id` parameter, if exists.
3. `/id/deleteKey` validates the paste identified by the `id` parameter and if `deleteKey` is indeed the accepted key to delete the paste file from the system.

---

## Plans

1. For the initial start, I've allocated **50GB** of SSD storage as this application utilizes insane IO, although non-blocking, to an extent. I will _probably_ purchase storage server if the storage needs ever arises. I have few options to work with.
    - AWS (Expensive as hell but reliable, I guess)
    - Wasabi (Fairly cheap, 1TB for \$5/mo.)
2. Depending on the server load, I might move the server onto a distributed network that can load balance the requests. (not sure if necessary)
3. **StoredIn** is currently behind Cloudflare and their caching is working as expected but the server itself is not in United States therefore, might have to purchase CDN services.
