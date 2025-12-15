## Create a comma-separated list of SHA256 hashes for specified files.
## Usage: ./create_revision.sh
## Output: Prints the SHA256 hashes as a comma-separated list.
## Note: Ensure the files exist in the current directory before running.
## Developed by: Prashant Shrestha
## Date: 2025-12-14 1924.

#!/bin/bash

sha256_list=""
files=("app.js" "config.js" ".env" "./routes/route.paste.js" "docker-compose.yml" "Dockerfile" "package.json")
APP_VERSION=$(cat ./VERSION 2>/dev/null)
INDEX_FILE_PATH="./views/index.html"

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        sha256=$(shasum -a 256 "$file" | awk '{print $1}')
        sha256_list+="$sha256,"
    fi
done

sha256_list="${sha256_list%,}"
echo "SHA256 List: $sha256_list"

md5_of_sha256=$(echo -n "$sha256_list" | md5)
md5_substring=${md5_of_sha256:0:6}

echo "MD5 of SHA256 List: $md5_of_sha256"
echo "MD5 Substring: $md5_substring"
echo "Application Version: $APP_VERSION"
echo "Final Revision: $APP_VERSION-$md5_substring"

sed -i '' "s|.*<span class=\"code_revision\">.*|<span class=\"code_revision\">Revision: $APP_VERSION-$md5_substring</span>|g" "$INDEX_FILE_PATH"

echo "Updated index.html with revision: $APP_VERSION-$md5_substring"
