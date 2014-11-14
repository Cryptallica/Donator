Cryptallica Donator
=======

### A JavaScript cryptocurrency donator widget

Using is very simple. Include donator.js and then specifiy by id the html object to transform into the donator.
```html
<div id="donator-example"></div>

<script>
//Arg1 id of object or html object itself, Arg2 customizeables
var donatorEx = new CryptDonator("donator-example", {
    //Set src of config json, will default to ./config.json
    src: "",
    
    //Set theme [default, darkthrone, mayhem]
    theme: "mayhem"
});
</script>
```

Configuring your donator is simple as well. Open up the config.json file to see how coins are organized. With valid json create objects for each coin with an address attribute. Without the address the coin will not be considered valid. Additionally you can specifiy a label. You can optionally create the config file and set it by src from CryptDonator function.
```json
{
  "bitcoin": {
    "address": "1Hyhm23xzUeRKjGCQMxBjmQMXGmtWPcnko",
    "src": "bitcoinqr.png",
    "label": "Bitcoins to cryptallica"
  },

  "dogecoin": {
    "address": "D7FZRJijWDtoRmivMB1wHeVJMgH9JAHGc4"
  }
}
```
Address is your coin address. src is the src to your qr image. Without this it will create by canvas or if no canvas support do nothing. Label is an optional label for the transaction.

### Requirements
* Webserver
* Browser with JavaScript

Using Canvas
* Firefox 31+
* IE 9+
* Chrome 31+
* Safari 5.1+
* Opera 24+
