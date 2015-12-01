INTRODUCTION
------------

This script (first introduced in Decentraleyes v1.1.5) should make reviewing this extension a lot easier than it used to be. It's open source and open for scrutiny, and it automatically compares the bundled libraries (resources) to their original sources (after removing any source mapping URLs).


FOR NON-LINUX USERS
-------------------

This usage guide is tailored to Linux based operating systems. If you're on a different type of system, the easiest direct solution might be to launch a free Linux box with Node.js pre-installed on Red Hat OpenShift. You can then SSH into it (after adding your own machine's public key to your account).

Having said that, every terminal command in the usage guide below comes with a description, so it should not be too hard to get this done on practically any type of configuration.


USAGE INSTRUCTIONS
------------------

1. Make sure you have Node.js installed on your machine (or install it).

2. Open up a terminal and 'cd' into this directory.
    Description: Navigate to this directory.

3. Execute 'npm install' to fetch any dependencies.

4. Run the audit script by executing 'node run'.
    Description: Run the script through Node.js and view the output.

Note: If you'd like to store the report, run 'node run > report.txt'.
    Note description: It's possible to write the console output to a file.
