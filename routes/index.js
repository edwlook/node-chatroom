
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', script: 'js/main.js' });
};
