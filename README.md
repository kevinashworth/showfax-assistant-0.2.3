# Showfax Assistant

Browser extension to make small but useful changes to Showfax webpages. Not affiliated with Showfax.com

## Install (for ye lovely Beta Testers of version 0.1.1 and higher)

Chrome 49 (or later) is required. [**Download**](https://github.com/kevinashworth/showfax-assistant/releases/latest), unzip, and install:

Navigate to chrome://extensions or click on the 3-dot Customize Chrome icon and select More Tools > Extensions
Select "Developer mode" and then click "Load unpacked extension..."
Navigate to local folder where you downloaded and unzipped, and voilà
Assuming there are no errors, the extension should load into your browser

## Node.js Installation for Developing This Extension With Javascript

	$ npm install

## Usage

Run `$ gulp --watch` and load the `dist`-directory into chrome.

## Entryfiles (bundles)

There are two kinds of entryfiles that create bundles.

1. All js-files in the root of the `./app/scripts` directory
2. All css-,scss- and less-files in the root of the `./app/styles` directory

## Tasks

### Build

    $ gulp


| Option         | Description                                                                                                                                           |
|----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--watch`      | Starts a livereload server and watches all assets. <br>To reload the extension on change include `livereload.js` in your bundle.                      |
| `--production` | Minifies all assets                                                                                                                                   |
| `--verbose`    | Log additional data to the console.                                                                                                                   |
| `--vendor`     | Compile the extension for different vendors (chrome, firefox, opera)  Default: chrome                                                                 |
| `--sourcemaps` | Force the creation of sourcemaps. Default: !production                                                                                                |


### pack

Zips your `dist` directory and saves it in the `packages` directory.

    $ gulp pack --vendor=firefox

### Version

Increments version number of `manifest.json` and `package.json`,
commits the change to git and adds a git tag.


    $ gulp patch      // => 0.0.X

or

    $ gulp feature    // => 0.X.0

or

    $ gulp release    // => X.0.0


## Globals

The build tool also defines a variable named `ENV` in your scripts. It will be set to `development` unless you use the `--production` option.


**Example:** `./app/background.js`

	if(ENV === 'development'){
		console.log('We are in development mode!');
	}







