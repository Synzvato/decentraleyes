Decentraleyes
=============

A [Firefox add-on](https://addons.mozilla.org/firefox/addon/decentraleyes) that emulates Content Delivery Networks (CDNs) locally by intercepting requests, finding the required resource and injecting it into the environment. This all happens instantaneously, automatically, and no prior configuration is required. Feel free to use this [testing utility](https://decentraleyes.org/test) to see if it's properly installed, enabled, and correctly configured.

> **Note:** Decentraleyes is no silver bullet, but it does prevent a lot of websites from making you send these kinds of requests. Ultimately, you can make Decentraleyes block requests for any missing CDN resources, too.

## Roadmap

Now that there's a solid, Mozilla approved, foundation, it's time to move forward. Mobility, extensibility (through support for community-powered resource packages), and usability, will be the main points of attention during this phase.

#### Essential Next Steps

* Start work on a resource bundle standard, to allow users to create and import custom resources. With support for these bundles in place, Decentraleyes will still work out of the box, but can be extended if needed.
* To keep this add-on from turning into bloatware, it's important to find out which versions of which libraries are most commonly used on websites, so that less popular resources can be removed from the default bundle.

#### Planned Features

* Advanced policy management for users who block requests for missing resources.
* Smarter resource version interpretation for handling dynamic notations.
* A minimalistic and non-essential graphical user interface.
* Support for custom, importable, library repositories.

> **Note:** These long-term goals are subjective to change, and can be discussed. That is, as long as the suggestions do not conflict with the ultimate goal of realizing a free and open standard for exchanging web resource bundles.

## Submitting Translations

Do you master a non-supported language? Please help out by translating this add-on on [Crowdin](https://crowdin.com/project/decentraleyes).

## Contributing Code

Suggestions in the form of **Issues** and contributions in the form of **Pull Requests** are highly welcome. You can also use the contact details and PGP key on the add-on [download page](https://addons.mozilla.org/firefox/addon/decentraleyes) to get in touch.

#### Prerequisites

* Jetpack Manager [jpm](https://developer.mozilla.org/Add-ons/SDK/Tools/jpm#Installation) (a Node-based replacement for cfx).
* Firefox version 38 or later. *If you need to work with earlier versions of Firefox, you'll need to use the old cfx tool. See instructions for [getting started with cfx](https://developer.mozilla.org/Add-ons/SDK/Tutorials/Getting_started).

#### Build Instructions (Unix)

    git clone https://github.com/Synzvato/decentraleyes
    cd decentraleyes
    jpm xpi

> **Important:** All commits since 26 October 2016 are signed with GPG. It's likely best to ignore unsigned commits, unless you really know what you're doing. Please send an email if you have any questions or security concerns.

## License

[MPL-2.0](https://www.mozilla.org/MPL/2.0).
