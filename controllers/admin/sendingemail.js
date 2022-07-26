
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hninnumml@gmail.com',
    pass: 'Hn1nnushw3'
  }
});

// var mailOptions = {
//   from: 'youremail@gmail.com',
//   to: 'myfriend@yahoo.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };
exports.sendEmail = function(mailOptions,callback) {
    transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
        callback(error);
    } else {
        console.log('Email sent: ' + info.response);
        callback(null,info);
    }
    });
}