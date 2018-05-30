Decentraleyes
=============

A [web browser extension](https://decentraleyes.org) that emulates Content Delivery Networks to improve your online privacy. It intercepts traffic, finds supported resources locally, and injects them into the environment. All of this happens automatically, so no prior configuration is required. Feel free to use the following [testing utility](https://decentraleyes.org/test) to find out if you are properly protected.

> **Note:** Decentraleyes is no silver bullet, but it does prevent a lot of websites from making you send these kinds of requests. Ultimately, you can make Decentraleyes block requests for any missing CDN resources, too.

## Contributing Code

Suggestions in the form of **Issues**, and contributions in the form of **Pull Requests**, are highly welcome. You can also use the public contact details and PGP key on the extension's [contact page](https://decentraleyes.org/contact) to get in touch.

#### Prerequisites

* [Jetpack Manager](https://developer.mozilla.org/Add-ons/SDK/Tools/jpm#Installation) ```v1.3.1``` *(or higher)*.
* Mozilla Firefox 38 *(or higher)*.

> **Note:** If you want to contribute to the Firefox Quantum extension, please check out the ```master``` branch. If you are looking for the Chromium-compatible codebase, please see the ```experimental``` branch.

#### Building the Code (*nix)

    git clone https://github.com/Synzvato/decentraleyes --branch legacy
    cd decentraleyes
    jpm xpi

> **Important:** All commits since 26 October 2016 are signed with GPG. It's likely best to ignore unsigned commits, unless you really know what you're doing. Please send an email if you have any questions or security concerns.

## Submitting Translations

Do you master a non-supported language? Please help out by translating this add-on on [Crowdin](https://crowdin.com/project/decentraleyes).

## License

[MPL-2.0](https://www.mozilla.org/MPL/2.0).
