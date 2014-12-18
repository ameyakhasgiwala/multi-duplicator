multi-duplicator
================

A node.js script which is capable of forwarding the request to a host and duplicate the same request to multiple VMs controllable though arguments

==== Usage ====
node /usr/local/bin/multi-duplicator -p 8102 -f vgerndvud362:8013 -d vgerndvud362:1234 -d vgerndvud362:4321
  -p port on which to listen for request
  -f host:port on which to forward the request
  -d host:port on which to duplicatethe request
