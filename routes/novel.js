
/*
 * GET novel list.
 */

exports.list = function(req, res){

	console.log('req.models = ' + JSON.stringify(req.models));

	req.models.novel.create([
		{
			title:'rene'
		}
	], function (err, items) {
			// err - description of the error or null
			// items - array of inserted items
	});

	
	res.render('novel/index', { title: 'Novel List' });
};