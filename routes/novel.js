
/*
 * GET novel list.
 */

exports.list = function(req, res){
  res.render('novel/index', { title: 'Novel List' });
};