'use strict';
var express = require('express');
var router = express.Router();


const dns = require('dns');


router.post('/check_domain', function(req, res) {
    var domainname = req.body.domainname;
  dns.lookup(domainname, (err, address, family) => {
    console.log('address: %j family: IPv%s ', address, family);
    if(address){
        res.send({status:200,text:"Domain is found.",ip:address});
    }else{
        res.send({status:500,text:"Domain not found.",ip:address});
    }
    

  });
  //OUTPUT : address: "157.240.13.35" family: IPv4
  /*
  dns.resolve4('www.facebook.com', (err, addresses) => {
    if (err) throw err;
  
    console.log(`addresses: ${JSON.stringify(addresses)}`);
  
    addresses.forEach((a) => {
      dns.reverse(a, (err, hostnames) => {
        if (err) {
          throw err;
        }
        console.log(`reverse for ${a}: ${JSON.stringify(hostnames)}`);
      });
    });
  });
  //OUTPUT : addresses: ["157.240.24.35"]
  //         reverse for 157.240.24.35: ["edge-star-mini-shv-01-sin2.facebook.com"]
*/
});



module.exports = router;