var mongoose = require('mongoose');
var logger = require('../lib/logger').trace;

var Schema = mongoose.Schema;

var schema = Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
	novel: { type: Schema.Types.ObjectId, ref: 'Novel' },
	chapter: { type: Number, default: 1},
  p_chapter: { type: Schema.Types.ObjectId, ref: 'Branch' }, //previous chapter branch
	p_branch: { type: Schema.Types.ObjectId, ref: 'Branch' }, //parent branch
	p_script: { type: Schema.Types.ObjectId, ref: 'Script' }, //parent script
  title: { type: String, required: true },
  scripts: [{ type: Schema.Types.ObjectId, ref: 'Script' }],
  type: { type: String, default:'private' },
  closed: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});


schema.methods.isMine = function(user) {
  if(user == null) return false;

  return this.owner._id+'' == user._id+'';
}

schema.methods.isSame = function(branch_id) {

  return this._id+'' == branch_id+'';
}

schema.methods.isWritable = function(user) {
  if(user == null) return false;

  return this.type != 'private' || this.owner._id+'' == user._id+'';
}

schema.methods.nextChapters = function(cb) {
  if(this.closed == false) {
    return cb(null, []);
  }

  this.model('Branch').find({p_branch:this._id, chapter:this.chapter+1}).exec(function(err, rows) {
    if(err) return cb(err);    
    cb(null, rows);
  });
}



//ex) 1.시작:$13-#3
schema.methods.chapterTitle = function(cb) {
  this.chapterBranches(function(err, branches) {
    if(branches == null || branches.length == 0)
      return cb(null, '');

    var title = '';
    for(var i=0 ; i<branches.length ; i++) {
      var b = branches[i];
      var bNext = branches[i+1];

      if(i==0) {
        title = b.title ? b.title : '무제';
      } 

      if(bNext === undefined) break;

      for(var j=0 ; j<b.scripts.length ; j++) {
        var s = b.scripts[j];
        //다음 브랜치가 이전 브랜치의 몇번째 스크립트의 브랜치인지...
        if(s._id+'' == bNext.p_script+'') {
          title += ('-(' + (j+1) + ':');
          //다음 브랜치가 해당 스크립트의 몇번쨰 브랜치인지...
          for(var k=0 ; s.branches.length ; k++) {
            var sb  = s.branches[k];
            if(sb+'' == bNext._id+'') {
              title += ((k+1) + ')');
              break;
            }
          }
          break;
        }
      }
    }
    cb(null, title);
  });
}


schema.methods.chapterScripts = function(cb) {
  this.chapterBranches(function(err, branches) {
    if(err) return cb(err);

    var scripts = [];

    for(var i=0 ; i<branches.length ; i++) {
      var b = branches[i];
      var bNext = branches[i+1];

      for(var j=0 ; j<b.scripts.length ; j++) {
        var s = b.scripts[j];
        scripts.push(s);
        //마지막 브랜치일 경우 그냥 모든 스크립트 추가
        if(bNext === undefined) continue;
        //다음 브랜치로 이동...
        if(s._id+'' == bNext.p_script+'') break;
      }
    }
    cb(null, scripts);
  });
}

schema.methods.chapterBranches = function(cb) {
  this.traverseBranches(this.chapter, function(err, array) {
    if(err) return cb(err);
    cb(null, array);
  });
}

schema.methods.traverseBranches = function(target_chapter, cb) {
  var thisObj = this;

  if(thisObj.chapter != target_chapter) {
    cb(null, []);
    return;
  }
  if(thisObj.p_branch == null) {
    cb(null, [thisObj]);
    return;
  }
  thisObj.model('Branch').findById(this.p_branch).populate('scripts').exec(function(err, parent) {
    if(err==null && parent != null) {
      parent.traverseBranches(target_chapter, function(err, array) {
        array.push(thisObj);
        cb(null, array);
      });
    }
  });
}


module.exports = mongoose.model('Branch', schema);