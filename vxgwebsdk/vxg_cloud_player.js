// VXG cloud player ver. 1.1.2.7 15/02/2025
// @language_out ES6
VXG_API_V2 = {
  post_v2_cameras_notifications_push_devices(channel_id,param)     {return this.r('POST',  'api/v2/cameras/'+channel_id+'/notifications/push/devices/',{}, params?params:{});},
  delete_v2_cameras_notifications_push_devices(channel_id,device_id) {return this.r('DELETE','api/v2/cameras/'+channel_id+'/notifications/push/devices/'+device_id+'/',{},params?params:{});},
  get_v2_cameras(params, camera_id)                               {return this.r('GET',   'api/v2/cameras/'+(camera_id?camera_id+'/':''),                       params?params:{'detail':'detail'}, {});},
  put_v2_cameras(camera_id, camera_data)                          {return this.r('PUT',   'api/v2/cameras/'+camera_id+'/',                                      {}, camera_data);},
  post_v2_cameras(camera_data)                                     {return this.r('POST',  'api/v2/cameras/',                                                    {}, camera_data);},
  delete_v2_cameras(camera_id)                                       {return this.r('DELETE','api/v2/cameras/'+camera_id+'/',                                      {}, {});},
  get_v2_cameras_meta(camera_id, params, tag)                     {return this.r('GET',   'api/v2/cameras/'+camera_id+'/'+(tag?tag+'/':''),                     params?params:{}, {});},
  post_v2_cameras_meta(camera_id, params)                          {return this.r('POST',  'api/v2/cameras/'+camera_id+'/',                                      {}, params?params:{});},
  put_v2_cameras_meta(camera_id, params, tag)                     {return this.r('PUT',   'api/v2/cameras/'+camera_id+'/'+tag+'/',                              {}, params?params:{});},
  delete_v2_cameras_meta(camera_id, tag)                             {return this.r('DELETE','api/v2/cameras/'+camera_id+'/'+tag+'/',                              {}, {});},
  get_v2_cameras_sharings(channel_id,params,share_id)             {return this.r('GET',   'api/v2/cameras/'+channel_id+'/sharings/'+(share_id?share_id+'/':''), params?params:{}, {});},
  post_v2_cameras_sharings(channel_id,params)                      {return this.r('POST',  'api/v2/cameras/'+channel_id+'/sharings/'+(share_id?share_id+'/':''), {}, params?params:{});},
  put_v2_cameras_sharings(channel_id,share_id, params)            {return this.r('PUT',   'api/v2/cameras/'+channel_id+'/sharings/'+share_id+'/',               {}, params?params:{});},
  delete_v2_cameras_sharings(channel_id,share_id)                    {return this.r('DELETE','api/v2/cameras/'+channel_id+'/sharings/'+share_id+'/',               {}, {});},
  get_v2_cameras_preview(camera_id)                               {return this.r('GET',   'api/v2/cameras/'+camera_id+'/preview/',                              {}, {});},
  get_v2_cameras_limits(camera_id)                                {return this.r('GET',   'api/v2/cameras/'+camera_id+'/limits/',                               {}, {});},
  get_v2_cameras_usage(camera_id)                                 {return this.r('GET',   'api/v2/cameras/'+camera_id+'/usage/',                                {}, {});},
  get_v2_sharings(params,share_id)                                {return this.r('GET',   'api/v2/sharings/'+(share_id?share_id+'/':''),                        {}, {});},
  put_v2_sharings(share_id,params)                                {return this.r('PUT',   'api/v2/sharings/'+share_id+'/',                                      {}, params);},
  post_v2_sharings(params)                                         {return this.r('POST',  'api/v2/sharings/',                                                   {}, params?params:{});},
  delete_v2_sharings(share_id)                                       {return this.r('DELETE','api/v2/sharings/'+share_i+'/',                                       {}, {});},
  get_v2_storage_events(params)                                   {return this.r('GET',   'api/v2/storage/events/',                                             params?params:{}, {});},
  get_v2_storage_thumbnails(params)                               {return this.r('GET',   'api/v2/storage/thumbnails/',                                         params?params:{}, {});},
  get_v2_storage_timeline(camera_id,params)                       {return this.r('GET',   'api/v2/storage/timeline/'+camera_id+'/',                             params?params:{}, {});},
  post_v2_storage_clips_sharings(clip_id,param)                    {return this.r('POST',  'api/v2/storage/clips/'+clip_id+'/sharings/',                         {}, params);},
  get_v2_storage_clips(clip_id, param)                            {return this.r('GET',   'api/v2/storage/clips/'+(clip_id?clip_id+'/':''),                     params, {});},
  post_v2_storage_clips(param)                                     {return this.r('POST',  'api/v2/storage/clips/',                                              {},params);},
  put_v2_storage_clips(clip_id, param)                            {return this.r('PUT',   'api/v2/storage/clips/'+clip_id+'/',                                  {},params);},
  delete_v2_storage_clips(clip_id)                                   {return this.r('DELETE','api/v2/storage/clips/'+(clip_id?clip_id+'/':''),                     {}, {});},
  post_v2_storage_memorycard_timeline(camera_id,param)             {return this.r('POST',  'api/v2/storage/memory_card/'+camera_id+'/timeline/',                 {}, param);},
  get_v2_storage_memorycard_timeline(camera_id,rid)               {return this.r('GET',   'api/v2/storage/memory_card/'+camera_id+'/timeline/'+rid+'/',         {}, {});},
  post_v2_storage_memorycard_synchronize(camera_id,param)          {return this.r('POST',  'api/v2/storage/memory_card/'+camera_id+'/synchronize/',              {}, param);},
  get_v2_storage_memorycard_synchronize(camera_id,rid)            {return this.r('GET',   'api/v2/storage/memory_card/'+camera_id+'/synchronize/'+rid+'/',      {}, {});},
  post_v2_storage_memorycard_synchronize_cancel(camera_id,rid)     {return this.r('POST',  'api/v2/storage/memory_card/'+camera_id+'/synchronize/'+rid+'/cancel/',{}, {});},
  get_v2_storage_data(params)                                        {return this.r('GET',   'api/v2/storage/data/', params, {});}
}
VXG_API_V4 = {
  get_v4_channel(params)                                          {return this.r('GET',   'api/v4/channel/',                                                    params?params:{}, {});},
  put_v4_channel(params)                                          {return this.r('PUT',   'api/v4/channel/',                                                    {}, params);},
  get_v4_clip(clip_id, params)                                    {return this.r('GET',   'api/v4/clips/'+(clip_id?clip_id+'/':''),                             params?params:{}, {});},
  put_v4_clip(clip_id, params)                                    {return this.r('PUT',   'api/v4/clips/'+clip_id+'/',                                          {},params?params:{});},
  post_v4_clip(params)                                             {return this.r('POST',  'api/v4/clips/',                                                      {}, params?params:{});},
  delete_v4_clip(clip_id)                                            {return this.r('DELETE','api/v4/clips/'+(clip_id?clip_id+'/':''),                             {}, {});},
  post_v4_meta(params)                                             {return this.r('POST',  'api/v4/meta/',                                                       {}, params?params:{});},
  put_v4_meta(params)                                             {return this.r('PUT',   'api/v4/meta/',                                                       {}, params?params:{});},
  delete_v4_meta(params)                                             {return this.r('DELETE','api/v4/meta/',                                                       {}, {});},
  post_v4_meta_filter(params)                                      {return this.r('POST',  'api/v4/meta/filter/',                                                {}, params?params:{});},
  delete_v4_meta_filter(params)                                      {return this.r('DELETE','api/v4/meta/filter/',                                                {}, {});},
  get_v4_storage_records(params, record_id)                       {return this.r('GET',   'api/v4/storage/records/'+(record_id?record_id+'/':''),               params?params:{}, {});},
  delete_v4_storage_records(record_id)                               {return this.r('GET',   'api/v4/storage/records/'+(record_id?record_id+'/':''),               {}, {});},
  post_v4_storage_records_upload()                                 {return this.r('POST',  'api/v4/storage/records/upload/',                                     {}, {});},
  get_v4_storage_images(params, images_id)                        {return this.r('GET',   'api/v4/storage/records/'+(images_id?images_id+'/':''),              params?params:{}, {});},
  delete_v4_storage_images(images_id)                                {return this.r('DELETE','api/v4/storage/records/'+(images_id?images_id+'/':''),               {}, {});},
  post_v4_storage_images_upload()                                  {return this.r('POST',  'api/v4/storage/records/upload/',                                     {}, {});},
  get_v4_live_watch()                                             {return this.r('GET',   'api/v4/live/watch/',                                                 {}, {});},
  get_v4_live_image()                                             {return this.r('GET',   'api/v4/live/image/',                                                 {}, {});},
  get_v4_live_source()                                            {return this.r('GET',   'api/v4/live/source/',                                                {}, {});},
  post_v4_live_source()                                            {return this.r('POST',  'api/v4/live/source/',                                                {}, {});},
  put_v4_live_source(params)                                      {return this.r('PUT',   'api/v4/live/source/',                                                {}, params?params:{});}
}
VXG_API_V5 = {
  get_v5_channels(params, channel_id){return this.r('GET','api/v5/channels/'+(channel_id?channel_id+'/':''),params?params:{'include_events_info':'true','preview':'true','include_meta':'true'},{});}
}

class CVxgCloud{
  getURL(file){
    return (this.origin ? this.origin : document.location.origin) + (this.path ? this.path : document.location.pathname.substr(0,document.location.pathname.lastIndexOf('/')+1)) + file;
  }
  setHook(hook_before, hook_after){
    this.hook_before = hook_before;
    this.hook_after = hook_after;
  }
  constructor(token, link_to_cloud){
    this.token = token;
    if (!token) return;
    this.prot = 'https:';
    try{this.token_json = JSON.parse(atob(token));} catch(e){
      if (this.token_json.length<20){console.error('Invalid token'); throw 'Invalid token';}
    }
    let token_type='LKey';
    if (this.token_json){
      token_type = (this.token_json['camid']===undefined && this.token_json['token']!==undefined) ? 'SI' : 'Acc';
      this.origin = this.token_json['api'] || link_to_cloud || 'web.skyvr.videoexpertsgroup.com';
      if (this.origin.substr(-1,1)=='/') this.origin = this.origin.substr(0,this.origin.length-1);
      if (location.protocol=='https:' && this.token_json['api_sp']) this.origin += ':'+this.token_json['api_sp'];
      else if (this.token_json['api_p']) this.origin += ':'+this.token_json['api_p'];
      this.path = this.token_json['path'] ? this.token_json['path'] : '/';
      if (this.path.substr(-1,1)!='/') this.path+='/';
      if (this.path && this.path.substr(0,1)!='/') this.path='/'+this.path;
    } else {
      this.origin = link_to_cloud || 'web.skyvr.videoexpertsgroup.com';
      if (this.origin.substr(-1,1)=='/') this.origin = this.origin.substr(0,this.origin.length-1);
      this.path = '/';
    }
    this.headers = this.headers || {};
    this.headers.Authorization = token_type+' '+token;
    if (token_type==='Acc'){
      if (VXG_API_V2) Object.assign(this, VXG_API_V2);
      if (VXG_API_V4) Object.assign(this, VXG_API_V4);
    }
    if (token_type==='LKey'){
      if (VXG_API_V2) Object.assign(this, VXG_API_V2);
      if (VXG_API_V3) Object.assign(this, VXG_API_V3);
      if (VXG_API_V5) Object.assign(this, VXG_API_V5);
      if (VXG_API_V6) Object.assign(this, VXG_API_V6);
    }
    if (token_type==='SI'){
      if (VXG_API_V2) Object.assign(this, VXG_API_V2);
      if (VXG_API_V4) Object.assign(this, VXG_API_V4);
      if (VXG_API_V5) Object.assign(this, VXG_API_V5);
    }
  }
  async r(type, path, get_param={}, post_param={}){
    if (!this.token) {
      return;
    }
    if (this.hook_before) this.hook_before(type, path, get_param, post_param);
    let self = this;
    if (path.substr(0,1)=='/') path = path.substr(1);
    if (path.substr(-1)!=='/') path += '/';
    let params = '';
    for (let i in get_param) { if (get_param.hasOwnProperty(i)) {params += (params?'&':'?') + i + '=' + get_param[i];}}

    let abort_controller = new AbortController();
    let ps = {method:type, signal:abort_controller.signal};
    if (this.headers) ps.headers = this.headers;

    if (type!=='GET') ps.body = JSON.stringify(post_param);

    let ret = fetch('https://'+this.origin + this.path + path + params,ps).then(function(r){
      if (parseInt(r.status/100)!==2) {
        return r.json().then(function(t){
          if (t && t.errorDetail)
            throw '['+r.status+'] '+t.errorDetail;
          throw '['+r.status+']';
        },function(t){
          throw '['+r.status+']';
        });
      }
      return r.json().then(function(t){
        if (self.hook_after) self.hook_after(t, type, path, get_param, post_param);
        return t;
      },function(t){
        if (self.hook_after) self.hook_after(t, type, path, get_param, post_param);
      });
    },function(r){
      if (location.protocol==='file:' && self.prot == 'https:') //FIXME
        self.prot = 'http:';
      throw r;
    });
    ret.abort_controller = abort_controller;
    return ret;
  }
  getCamera(id){
    if (isNaN(parseInt(id))) return;
    let cam_obj = new VXG.CAMERA;
    cam_obj.api = new VXG.CLOUDAPI(cam_obj, this.api.server_token, this.api.server_token_type, this.api.server_url, this.api.as_cloud, true);
    if (this.api.as_cloud) Object.assign(cam_obj.api, VXG_API_V4);
    cam_obj.id = parseInt(id);
    return cam_obj;
  }
}

class CVxgCamera extends CVxgCloud{
  constructor(token, link_to_cloud, channel_id){
    let ts = token.split(';');
    if (ts.length>0 && parseInt(ts[0])>0){
      this.id = parseInt(ts[0]);
      token = ts[1];
    }
    super(token,link_to_cloud);
    if (this.token_json && this.token_json['camid']) this.id = parseInt(this.token_json['camid']);
    if (!this.id){console.error('No channel id');throw 'No channel id';}
  }
  isFullAccess(){
    return !this.token_json || this.token_json['access']=='all';
  }
  set_token(acc_token){
    try{this.token_json = JSON.parse(atob(acc_token));} catch(e){return;};
    this.token = acc_token;
    if (!isNaN(parseInt(this.token_json['camid']))) this.id = parseInt(this.token_json['camid']);
    this.readonly = this.token_json['access']!='all';
  }
  set_v2_data(v2_data){
    this.v2_data = v2_data;
    this.name = v2_data.name;
    this.id = v2_data.id;
    if (v2_data.status) this.status= v2_data.status;
    if (v2_data.access!==undefined) this.readonly = v2_data.access.indexOf('all')===-1;
  }
  set_v3_data(v3_data){
    this.v3_data = v3_data;
    if (v3_data.access_tokens) {
      if (v3_data.access_tokens['all']) {this.set_token(v3_data.access_tokens['all']);this.readonly=false;}
      else if (v3_data.access_tokens['watch']) {this.set_token(v3_data.access_tokens['watch']);this.readonly=true;}
    }
    this.name = v3_data.name;
    this.name = v3_data.id;
  }
  set_v4_data(v4_data, acc_token, readonly){
    this.readonly = readonly===undefined ? true : readonly;
    if (acc_token) this.set_token(acc_token);
    this.v4_data = v4_data;
    this.name = v4_data.name;
    if (v4_data.status) this.status= v4_data.status;
  }
  set_v5_data(v5_data){
    this.v5_data = v5_data;
    if (v5_data.token) this.set_token(v5_data.token);
    this.name = v5_data.name;
    this.id = v5_data.id;
    if (v5_data.status) this.status= v5_data.status;
  }
  getToken(){
    let self = this;
    if (this.token) return new Promise(function(resolve, reject){resolve(self.token);});
    if (!this.id) return new Promise(function(resolve, reject){reject();});
    if (this.get_v5_channels)
      return this.get_v5_channels(null,this.id).then(function(r){
        self.set_v5_data(r);
        return r.token;
      });
    if (this.get_v3_channels)
      return this.get_v3_channels(null,this.id).then(function(r){
        self.set_v3_data(r);
        return self.token;
      });
  }
  getName(){
    let self = this;
    if (this.name) return new Promise(function(resolve, reject){resolve(self.name);});
    if (!this.id) return new Promise(function(resolve, reject){reject('No channel id');});
    if (this.get_v2_cameras) return this.get_v2_cameras(null,this.id).then(function(r){
      self.set_v2_data(r);
      return r.name;
    });
    if (this.get_v5_channels) return this.get_v5_channels(null,this.id).then(function(r){
      self.set_v5_data(r);
      return r.name;
    });
    if (!this.get_v4_channel) return new Promise(function(resolve, reject){reject();});
    return this.get_v4_channel().then(function(r){
      self.set_v4_data(r);
      return r.name;
    });
  }
  setLastStatus(status){
    this.last_status = status;
  }
  getLastStatus(){
    if (!this.last_status) this.last_status='inactive';
    return this.last_status;
  }
  getReqMode(){
    let self = this;
    if (this.get_v2_cameras) return this.get_v2_cameras(null,this.id).then(function(r){
      self.set_v2_data(r);
      return r.rec_mode;
    });
  }
  getStatus(){
    let self = this;
//        if (this.status) return new Promise(function(resolve, reject){resolve(self.status);});
    if (!this.id) return new Promise(function(resolve, reject){reject('No channel id');});
    if (this.get_v2_cameras) return this.get_v2_cameras(null,this.id).then(function(r){
      self.set_v2_data(r);
      self.last_status = r.status;
      return r.status;
    });
    if (this.get_v5_channels) return this.get_v5_channels(null,this.id).then(function(r){
      self.set_v5_data(r);
      self.last_status = r.status;
      return r.status;
    });
    if (!this.get_v4_channel) return new Promise(function(resolve, reject){reject();});
    return this.get_v4_channel().then(function(r){
      self.set_v4_data(r);
      self.last_status = r.status;
      return r.status;
    });
  }
  getStorageTimeline(start_time, end_time, limit){
    return this.get_v2_storage_timeline(this.id, {slices:3,limit:(limit||50),start:(new Date(start_time)).toISOString().substr(0,23),end:(new Date(end_time)).toISOString().substr(0,23)});
  }
  getStorageEvents(start_time, end_time, limit){
    return this.get_v2_storage_events({camid: this.id, slices:3, limit:(limit||50), start:(new Date(start_time)).toISOString().substr(0,23), end:(new Date(end_time)).toISOString().substr(0,23)});
  }

  getStorageThumbnails(time,reverse,limit, camera_id, time_to){
    let params = {limit:(limit||50), order_by:'time'};
    if (reverse) params['order_by']='-time';
    if (camera_id) params['camid']=camera_id;
    if (reverse) {
      params['end']=(new Date(time)).toISOString().substr(0,23);
      if (time_to)
        params['start']=(new Date(time_to)).toISOString().substr(0,23);
    }else {
      params['start']=(new Date(time+ 1000)).toISOString().substr(0,23);
      if (time_to)
        params['end']=(new Date(time_to)).toISOString().substr(0,23);
    }
    return this.get_v2_storage_thumbnails(params);
  }
  getStorageRecords(time,reverse,limit){
    let params = {limit:(limit||50)};
    if (reverse) params['order_by']='-time';
    if (reverse)  params['end']=(new Date(time)).toISOString().substr(0,23);
    else params['start']=(new Date(time)).toISOString().substr(0,23);
    return this.get_v4_storage_records(params);
  }
  getOneStorageRecord(time_from,time_to,retry_count, cancel_func){
    let t1 = typeof time_from === 'string' ? time_from : (new Date(time_from)).toISOString().substr(0,23);
    let t2 = typeof time_to === 'string' ? time_to : (new Date(time_to)).toISOString().substr(0,23);
    let params = {limit:1, start: t1, end: t2};
    let self = this;
    return this.get_v4_storage_records(params).then(function(r){
      if (r.objects.length || retry_count<1 || cancel_func()) return r;
      return new Promise(function(resolve, reject){setTimeout(function(){resolve()},1000);}).then(function(){
        return self.getOneStorageRecord(time_from,time_to,retry_count-1, cancel_func);
      });
    });
  }
  getStorageData(params) {
    return this.get_v2_storage_data(params);
  }
  getStorageMemorycardTimeline(start_time, end_time, retry_count){
    let self = this;
    if (!retry_count) retry_count=50;
    if (this.timeline_promise) return this.timeline_promise;
    this.timeline_promise =  this.post_v2_storage_memorycard_timeline(this.id,{start:(new Date(start_time)).toISOString().substr(0,23),end:(new Date(end_time)).toISOString().substr(0,23)}).then(function(trd){
      if (trd.status!=='pending') {
        self.timeline_promise = undefined;
        return trd;
      }
      let check = function(rid, rc){
        if (!rc) {
          self.timeline_promise = undefined;
          return self.getStorageMemorycardTimeline(start_time, end_time);
        }
        return self.get_v2_storage_memorycard_timeline(self.id, rid).then(function(r){
          if (r.status!=='pending') {
            self.timeline_promise = undefined;
            return r;
          }
          return new Promise(function(resolve, reject){setTimeout(function(){resolve()},1000);}).then(function(){
            return check(rid, rc-1);
          });
        });
      }
      return check(trd.id, retry_count);
    },function(){
      self.timeline_promise = undefined;
    });
    return this.timeline_promise;
  }
  getStorageMemorycardSynchronize(start_time, end_time, cb, retry_count){
    let self = this;
    if (!retry_count) retry_count=100;

    let st = typeof start_time === 'string' ? start_time : (new Date(start_time)).toISOString().substr(0,23);
    let et = typeof end_time === 'string' ? end_time : (new Date(end_time)).toISOString().substr(0,23);
    return this.post_v2_storage_memorycard_synchronize(this.id,{/*existing_data:'delete',*/start:st,end:et}).then(function(trd){
//            return trd;
      if (trd.status!=='pending') return trd;
      let check = function(rid, rc){
        if (!rc)
          return new Promise(function(resolve, reject){setTimeout(function(){resolve()},1000);}).then(function(){
            return self.getStorageMemorycardSynchronize(start_time, end_time, cb);
          });
        if (cb) cb();
        return new Promise(function(resolve, reject){setTimeout(function(){resolve()},1000);}).then(function(){
          return self.get_v2_storage_memorycard_synchronize(self.id, rid).then(function(r){
            if (r.status!=='pending') return r;
            return new Promise(function(resolve, reject){setTimeout(function(){resolve()},100);}).then(function(){
              return check(rid,rc-1);
            });
          });
        });
      }
      return check(trd.id, retry_count);
    });
  }
  invalidate(){
  }
}
class CTimeMap {
  constructor() {
    this.ranges = [];
  }

  addTimeRange(start, end) {
    if (start >= end) {
      return;
    }

    const index = this.ranges.findIndex((range) => range.start >= start);
    if (index === -1) {
      this.ranges.push({ start, end });
    } else {
      this.ranges.splice(index, 0, { start, end });
    }

    this.mergeRanges();
  }

  mergeRanges() {
    for (let i = 0; i < this.ranges.length - 1; i++) {
      const a = this.ranges[i];
      const b = this.ranges[i + 1];
      if (this.checkIntersection(a, b)) {
        a.start = Math.min(a.start, b.start);
        a.end = Math.max(a.end, b.end);
        this.ranges.splice(i + 1, 1);
        i --;
      }
    }
  }

  checkIntersection(range1, range2) {
    if (!range1 || !range2) {
      return false;
    }
    return range1.end + 1 >= range2.start && range2.end + 1 >= range1.start;
  }

  checkContained(range1, range2) {
    if (!range1 || !range2) {
      return false;
    }
    return range1.start <= range2.start && range1.end >= range2.end;
  }

  getTimeRange(time) {
    return this.ranges.find((range) => range.start <= time && range.end >= time);
  }

  includeTime(time) {
    return Boolean(this.getTimeRange(time));
  }

  includeRange(start, end) {
    const target = { start, end };
    return this.ranges.some((range) => this.checkContained(range, target));
  }
}
class CKEventMark extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();

    this.tooltip = null;

    this.showTooltipHandler = this.showTooltip.bind(this);
    this.removeTooltipHandler = this.removeTooltip.bind(this);
  }

  connectedCallback() {
    const name = this.getAttribute('name');
    const timestamp = this.getAttribute('timestamp');
    this.setAttribute('title', `${name}  ${timestamp}`);

    this.addEventListener('mouseover', this.showTooltipHandler);
    this.addEventListener('mouseout', this.removeTooltipHandler);
  }

  disconnectedCallback(){
    this.removeTooltip();
    this.removeEventListener('mouseover', this.showTooltipHandler);
    this.removeEventListener('mouseout', this.removeTooltipHandler);
  }

  showTooltip() {
    this.removeTooltip();

    const thumbnail = this.getAttribute('thumbnail');
    if (thumbnail) {
      this.tooltip = document.createElement("div");
      this.tooltip.classList.add('k-tooltip-container');
      this.tooltip.innerHTML = `<img src="${thumbnail}" alt="" style="width: 100%" />`;

      const rt = this.getBoundingClientRect();
      this.tooltip.style.position = 'fixed';
      this.tooltip.style.top = `${rt.top - 4}px`;
      this.tooltip.style.left = `${rt.left}px`;
      this.tooltip.style.zIndex = '10000';
      this.tooltip.style.display = 'flex';
      this.tooltip.style.alignItems = 'center';
      this.tooltip.style.justifyContent = 'center';
      this.tooltip.style.width = '256px';
      // this.tooltip.style.minHeight = '100px';
      this.tooltip.style.transform = 'translate(-50%, -100%)';
      // this.tooltip.style.border = '1px solid white';
      this.tooltip.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';

      document.body.appendChild(this.tooltip);
    }
  }

  removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  css() {
    return ``;
  }
}

window.customElements.define('k-event-mark', CKEventMark);
class CTimeLinePicker extends HTMLElement {
  static get observedAttributes() {
    return ['scale', 'centerutctime', 'selectutctime', 'utc'];
  }

  constructor() {
    super();
    this.event_skip = new Event('skip', {cancelable: false, bubbles: true});
    this.default_scale = 100;
    this.min_frame_width = 18;
    this.min_sec_frame_width = 155;
    this.min_hoursec_width = 57;
    this.min_year_width = 32;
    this.display_events_count = 50;
  }

  recalcWidths() {
    this.min_year_width = this.textWidth('0000');
    this.min_months_width = this.textWidth('M');
    this.min_year_month_width = this.textWidth('2020 May') + 6;
    this.min_day_width = this.textWidth('00') + 10;
    this.min_day_hour_width = this.textWidth('22 Feb 2020') + 2;
    this.min_hour_width = this.textWidth('00:00');
    this.min_hoursec_width = this.textWidth('00:00:00');
    this.min_frame_width = this.textWidth('00') + 2;
    this.min_sec_frame_width = this.textWidth('22 Feb 2020, 00:00:000') + 2;
    this.default_scale = 60 * 60 * 24 * 365 / (this.min_year_width * 1);
  }

  adjustTime(time) {
    let mintime = this.getAttribute('mintime');
    if (mintime !== null) {
      if (mintime[0] != '+' && mintime[0] != '-' && parseInt(mintime) == mintime) {
        mintime = parseInt(mintime);
      } else {
        let t = parseInt(mintime.substr(1));
        if (mintime[0] == '+' && !isNaN(t))
          mintime = new Date().getTime() + t;
        else if (mintime[0] == '-' && !isNaN(t))
          mintime = new Date().getTime() - t;
        else
          mintime = new Date().getTime()
      }

      if (mintime !== undefined && time < parseInt(mintime)) {
        time = parseInt(mintime);
      }
    }

    let maxtime = this.getAttribute('maxtime');
    if (maxtime !== undefined) {
      if (maxtime[0] != '+' && maxtime[0] != '-' && parseInt(maxtime) == maxtime) {
        maxtime = parseInt(maxtime);
      } else {
        let t = parseInt(maxtime.substr(1));

        if (maxtime[0] == '+' && !isNaN(t)) {
          maxtime = new Date().getTime() + t;
        } else {
          if (maxtime[0] == '-' && !isNaN(t)) {
            maxtime = new Date().getTime() - t;
          } else {
            maxtime = new Date().getTime();
          }
        }
      }

      if (maxtime !== undefined && time > parseInt(maxtime)) {
        time = parseInt(maxtime);
      }
    }
    return time;
  }

  connectedCallback() {
    let self = this;
    this.addEventListener("mousewheel", function (e) {
      if (self.getAttribute('disabled') !== null) return;

      if (e.wheelDeltaX == 0 && e.offsetX < self.getBoundingClientRect().width / 2) {
        let scale = self.getAttribute('scale');
        scale = scale === null ? self.default_scale : (scale);

        if (e.wheelDelta / 120 > 0) {
          scale = scale / 1.5;

          let req_frames = self.getAttribute('frames') || 1;
          if (req_frames > 1 && req_frames * frames <= 1 / scale) {
            scale = 1 / self.min_frame_width / req_frames;
          }
          if (req_frames <= 1 && 1 / scale > self.min_hoursec_width) {
            scale = 1 / self.min_hoursec_width;
          }
        } else {
          let new_scale = scale * 1.5;
          if (self.min_year_width <= 60 * 60 * 24 * 365 * 1000 / new_scale) {
            scale = new_scale;
          }
        }

        if (
          !isNaN(parseInt(self.getAttribute('maxscale'))) &&
          scale > parseInt(self.getAttribute('maxscale'))
        ) {
          scale = parseInt(self.getAttribute('maxscale'));
        }

        if (
          !isNaN(parseInt(self.getAttribute('minscale'))) &&
          scale < parseInt(self.getAttribute('minscale'))
        ) {
          scale = parseInt(self.getAttribute('minscale'));
        }

        self.loc_change = true;
        self.setAttribute('scale', scale > 1 ? scale : 1);
        self.loc_change = undefined;
      } else {
        let new_time = parseInt(self.getAttribute('centerutctime') || 0) + this.one_shift_time * e.wheelDelta / 120;
        new_time = self.adjustTime(new_time);
        self.loc_change = true;
        self.setAttribute('centerutctime', new_time);
        self.loc_change = undefined;
      }
      e.stopPropagation();
      e.preventDefault();
      return false;
    });

    let handleMouseUp = (event) => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      delete self.down_mouse_posx;
      delete self.down_mouse_time;

      setTimeout(() => {
        self.dispatchEvent(new Event('moved', { cancelable: false, bubbles: true }));
      }, 0);
    };

    let handleMouseMove = (event) => {
      let scale = parseFloat(self.getAttribute('scale') || 100);
      let pixel_shift = event.pageX - self.down_mouse_posx;
      let new_time = parseInt(self.down_mouse_time - pixel_shift * scale);
      new_time = self.adjustTime(new_time);
      self.loc_change = true;
      self.setAttribute('centerutctime', new_time);
      self.loc_change = undefined;
    };

    this.addEventListener('mousedown', (event) => {
      if (self.getAttribute('disabled') !== null) return;

      self.down_mouse_posx = event.pageX;
      self.down_mouse_time = parseInt(self.getAttribute('centerutctime'));
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      setTimeout(() => {
        self.dispatchEvent(new Event('moving', { cancelable: false, bubbles: true }));
      }, 0);

      return event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });

    window.addEventListener("resize", function () {
      self.update(true);
    }, false);

    this.recalcWidths();

    this.style.display = "block";
    this.shadow = this.attachShadow({
      mode: 'open'
    });

    this.shadow.innerHTML = CTimeLinePicker.css;
//        $(this).css('position','relative').css('overflow','hidden');

    let params = '';
    if (this.hasAttribute('databar')) {
      params += ' databar';
    }
    if (this.hasAttribute('multi-databars')) {
      params += ' multi-databars';
    }

    this.shadow.innerHTML += `
        <div class="body" ${params}>
            <div class="centerpos" style="display: none"></div>
            <div class="wrap">
                <div class="twrap">
                    <div class="range"></div>
                    <div class="databars"></div>
                    <table>
                        <tr></tr>
                        <tr></tr>
                    </table>
                </div>
            </div>
        </div>
    `

    this.centerpos = this.shadow.querySelector('.centerpos');
    this.wrap = this.shadow.querySelector('.wrap');
    this.twrap = this.shadow.querySelector('.twrap');
    this.table = this.shadow.querySelector('table');
    this.databars = this.shadow.querySelector('.databars');
    this.line1 = this.shadow.querySelector('table tr:first-child');
    this.line2 = this.shadow.querySelector('table tr:last-child');

    if (this.getAttribute('scale') === null || this.getAttribute('centerutctime') === null) {
      this.loc_change = true;
      if (this.getAttribute('scale') === null) {
        this.setAttribute('scale', this.default_scale); // 50 pixels per year
      }
      if (this.getAttribute('centerutctime') === null) {
        this.setAttribute('centerutctime', this.adjustTime(Date.now()));
      }
      this.loc_change = false;
    } else {
      this.attributeChangedCallback();
    }
  }

  disconnectedCallback() {
    delete this.event_skip;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let self = this;
    if (!this.table) {
      if (name == 'scale') {
        this.default_scale = parseInt(newValue);
      }
      return;
    }

    if (name == 'centerutctime') {
      let shift_time = parseInt(oldValue) - parseInt(newValue);
      let scale = parseInt(self.getAttribute('scale') || 100);
      if (this.down_mouse_posx !== undefined) {
        self.update(!self.loc_change);
      } else {
        if (shift_time != 0 && !isNaN(shift_time)) {
          clearTimeout(this.move_anivate_timer);
          let lc = !!self.loc_change;
          this.move_anivate_timer = setTimeout(function () {
            self.moveAnimate(parseInt(shift_time / scale), !lc);
          }, 0);
        } else {
          this.update(!this.loc_change);
        }
      }

      return;
    }

    if (name == 'scale') {
      this.scaleAnimate(parseFloat(oldValue), !self.loc_change);
      return;
    }

    this.update(!self.loc_change);
  }

  scaleAnimate(oldscale, from_out) {
    let self = this;

    if (this.scale_timer) return;

    this.scale_timer = setTimeout(() => {
      let scale = parseFloat(self.getAttribute('scale') || 100);
      scale = oldscale / scale;

      self.table.style.transform = 'scaleX(1)';
      let animate = self.table.parentElement.parentElement.animate([{transform: 'scaleX(' + (scale || 1) + ')'}], 100);
      animate.onfinish = function () {
        self.table.parentElement.parentElement.style.transform = 'scaleX(1)';
        self.update(from_out);
        delete self.scale_timer;
      }
    }, 0);
  }

  moveAnimate(animate_move_pixels, from_out) {
    let self = this;
    if (this.animate_move_pixels === undefined) this.animate_move_pixels = 0;
    this.animate_move_pixels = this.animate_move_pixels + animate_move_pixels;

    if (this.animater) {
      try {
        this.animater.commitStyles();
        this.animater.cancel();
      } catch {}
    }
    this.animater = this.twrap.animate([
      {left: this.animate_move_pixels + 'px'}
    ], 100);

    this.animater.onfinish = function () {
      self.animater = undefined;
      self.animate_move_pixels = 0;
      self.twrap.style.left = 0;
      self.update(from_out);
    };
  }

  divider(val, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (val > arr[i]) return arr[i];
    }
    return val;
  }

  static get RANGES() {
    return;
  }

  getLeftPixelTime() {
    let centerutctime = parseInt(this.getAttribute('centerutctime') || Date.now());
    let screen_width = this.getBoundingClientRect().width;
    const scale = parseFloat(this.getAttribute('scale') || 0);
    return parseInt(centerutctime - scale * screen_width * 1.5);
  }

  getRightPixelTime(){
    let centerutctime = parseInt(this.getAttribute('centerutctime') || Date.now());
    let screen_width = this.getBoundingClientRect().width;
    const scale = parseFloat(this.getAttribute('scale') || 0);
    return parseInt(centerutctime + scale * screen_width * 1.5);
  }

  getOnePixelTime(){
    return parseFloat(this.getAttribute('scale') || 0);
  }

  update(from_out) {
    let self = this;
    if (!this.table) return;
    let screen_width = this.getBoundingClientRect().width;
    if (!screen_width && this.last_screen_width > 0) {
      screen_width = this.last_screen_width;
    }

    if (!screen_width) return;

    this.last_screen_width = screen_width;
    if (!this.min_year_width) this.recalcWidths();
    if (!this.min_year_width) return;
    // if (this.update_timer) clearTimeout(this.update_timer);
    // if (!screen_width) {this.update_timer = setTimeout(function(){delete self.update_timer;self.update();},500);return;}
    this.centerpos.style.display = 'block';

    const scale = parseFloat(this.getAttribute('scale') || 0);
    const MAX_PIXELS_PER_YEAR = parseInt(60 * 60 * 24 * 365 * 1000 / scale);
    const MAX_PIXELS_PER_MONTH = parseInt(60 * 60 * 24 * 31 * 1000 / scale);
    const PIXELS_PER_DAY = 60 * 60 * 24 * 1000 / scale;
    const PIXELS_PER_HOUR = 60 * 60 * 1000 / scale;
    const PIXELS_PER_MINUTE = 60 * 1000 / scale;
    const PIXELS_PER_SECOND = 1000 / scale;

    const MONTHS_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//            let MONTHS_NAMES = ['January','February','March','April','May','June','Jule','August','September','October','November','December'];

    this.one_shift_time = 1000;

    // Seconds per pixel
    let centerutctime = parseInt(this.getAttribute('centerutctime') || Date.now());
    if (centerutctime === undefined || scale === undefined) return;

    let left_time = parseInt(centerutctime - scale * screen_width * 1.5);
    let right_time = parseInt(centerutctime + scale * screen_width * 1.5);

    let left_date = new Date(left_time + this.getTimeOffset());
    let right_date = new Date(right_time + this.getTimeOffset());

    // as "only years" mode
    let only_years_mode = this.min_months_width >= MAX_PIXELS_PER_MONTH;
    let seconds_frame_mode = this.min_sec_frame_width < PIXELS_PER_SECOND;
    let day_seconds_mode = seconds_frame_mode ? false : this.min_hoursec_width < PIXELS_PER_HOUR / 2;
    let day_hour_mode = seconds_frame_mode || day_seconds_mode ? false : this.min_day_hour_width <= PIXELS_PER_DAY;
    let months_day_mode = seconds_frame_mode || day_hour_mode || day_seconds_mode ? false : this.min_year_month_width < MAX_PIXELS_PER_MONTH;
    let year_months_mode = seconds_frame_mode || months_day_mode || day_hour_mode || day_seconds_mode ? false : (this.min_months_width < MAX_PIXELS_PER_MONTH);

    let left_day_time = this.roundDayDown(left_time);
    let right_day_time = this.roundDayUp(right_time);

    let line1 = '', line2 = '';
    this.ranges = [];
    if (only_years_mode || year_months_mode) {
      let prev_pos = 0, sum_milli_seconds = 0;
      let i = new Date(left_date);
      do {
        sum_milli_seconds += this.getYearSeconds(i.getFullYear());
        let next_pos = sum_milli_seconds / scale;
        let ys = Math.round(next_pos - prev_pos);

        let text = i.getFullYear();
        if (screen_width / 2 < 365 * 24 * 60 * 60 * 1000 / scale) {
          let g = Math.ceil(365 * 24 * 60 * 60 * 1000 / scale / screen_width) + 1;
          let text2 = text;
          text = '';
          for (let ii = 0; ii < g; ii++)
            text += '<div>' + text2 + '</div>';
        }

        line1 += '<td style="min-width:' + ys + 'px;max-width:' + ys + 'px"' + (only_years_mode ? ' rowspan=2' : '') + (year_months_mode ? ' colspan=12' : '') + '><div>' + text + '</div></td>';
        this.ranges.push([i.getTime(), ys]);
        prev_pos += ys;
      } while (i < right_date && i.setFullYear(i.getFullYear() + 1));
      let left_day = new Date(left_date.getFullYear(), 0, 1, 0, 0, 0);
      this.table_left_time = left_day.getTime();
      this.one_shift_time = 60 * 60 * 24 * 365 * 1000;
    }

    if (year_months_mode) {
      this.ranges = [];
      let prev_pos = 0, month_seconds_sum = 0;
      let i = new Date(left_date.getFullYear(), 0, 1, 0, 0, 0);
      this.table_left_time = i.getTime() - this.getTimeOffset();
      let e = new Date(right_date.getFullYear() + 1, 0, 1, 0, 0, 0);
      do {
        month_seconds_sum += this.getMonthSeconds(i.getFullYear(), i.getMonth());
        let next_pos = month_seconds_sum / scale;
        let ms = Math.round(next_pos - prev_pos);
        line2 += '<td style="min-width:' + ms + 'px;max-width:' + ms + 'px";"><div>' + MONTHS_NAMES[i.getMonth()] + '</div></td>';
        this.ranges.push([i.getTime(), ms]);
        prev_pos += ms;
      } while (i < e && i.setMonth(i.getMonth() + 1));

      this.one_shift_time = 60 * 60 * 24 * 30 * 1000;
    }

    if (months_day_mode) {
      let prev_pos = 0, msilliseconds_sum = 0;
      let i = new Date(left_date.getFullYear(), left_date.getMonth(), 1, 0, 0, 0);
      this.table_left_time = i.getTime() - this.getTimeOffset();
      let e = new Date(right_date.getFullYear(), right_date.getMonth() + 1, 1, 0, 0, 0);

      do {
        let dim = this.getDaysInMonth(i.getFullYear(), i.getMonth());
        let month_divider = this.divider(MAX_PIXELS_PER_MONTH / this.min_day_width, [dim, 10, 6, 4, 3, 2, 1]);
        let text = MONTHS_NAMES[i.getMonth()] + ' ' + i.getFullYear();
        if (screen_width / 2 - this.min_day_hour_width < MAX_PIXELS_PER_MONTH) {
          let g = Math.ceil(MAX_PIXELS_PER_MONTH / screen_width) + 1;
          let text2 = text;
          text = '';
          for (let ii = 0; ii < g; ii++)
            text += '<div>' + text2 + '</div>';
        }
        line1 += '<td colspan=' + month_divider + '><div>' + text + '</div></td>';
        let d = new Date(i);
        let de = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0);
        let divs_count = month_divider;
        do {
          divs_count--;
          let next_pos = (d.getTime() - this.getTimeOffset() - this.table_left_time + parseInt(dim / month_divider) * 24 * 60 * 60 * 1000) / scale;
          if (!divs_count)
            next_pos = (i.getTime() - this.getTimeOffset() + dim * 24 * 60 * 60 * 1000 - this.table_left_time) / scale;
          let dw = Math.round(next_pos - prev_pos);
          let style = ' style="width:' + dw + 'px;min-width:' + dw + 'px;max-width:' + dw + 'px;"';
          line2 += '<td' + style + '><div>' + d.getDate() + '</div></td>';
          this.ranges.push([d.getTime(), dw]);
          prev_pos += dw;
          if (!divs_count) break;
          d.setDate(d.getDate() + parseInt(dim / month_divider));
        } while (d < de);
        i.setMonth(i.getMonth() + 1);
      } while (i < e);

      this.one_shift_time = 60 * 60 * 24 * 1000;
    }

    if (day_hour_mode) {
      let day_divider = this.divider(PIXELS_PER_DAY / this.min_hour_width, [24, 12, 8, 6, 4, 3, 2, 1]);
      let prev_pos = 0;
      let i = new Date(left_date);

      do {
        let text = (i.getDate()) + ' ' + MONTHS_NAMES[i.getMonth()] + ' ' + i.getFullYear();

        if (screen_width / 2 < 24 * 60 * 60 * 1000 / scale) {
          let g = Math.ceil(24 * 60 * 60 * 1000 / scale / screen_width) + 1;
          let text2 = text;
          text = '';
          for (let ii = 0; ii < g; ii++)
            text += '<div>' + text2 + '</div>';
        }

        line1 += '<td colspan=' + day_divider + '><div>' + text + '</div></td>';
        for (let hour = 0; hour < 24; hour += 24 / day_divider) {
          let next_pos = (i.getTime() - left_date.getTime() + (hour + 24 / day_divider) * 60 * 60 * 1000) / scale;
          let full_width = Math.round(next_pos - prev_pos);
          line2 += '<td style="width:' + full_width + 'px;min-width:' + full_width + 'px;max-width:' + full_width + 'px;">&nbsp;<div>' + hour + ':00</div></td>';
          this.ranges.push([i.getTime() + hour * 60 * 60 * 1000, full_width]);
          prev_pos += full_width;
        }
      } while (i < right_date && i.setDate(i.getDate() + 1));

      let left_day = new Date(left_date.getFullYear(), left_date.getMonth(), left_date.getDate(), 0, 0, 0);
      this.table_left_time = left_day.getTime() - this.getTimeOffset();
      this.one_shift_time = parseInt(60 * 60 * 24 * 1000 / day_divider);
    }

    if (day_seconds_mode) {
      let day_width = 60 * 60 * 24 * 1000 / scale;
      let hour_divider = this.divider(day_width / this.min_hoursec_width / 24, [60 * 60, 60 * 30, 60 * 12, 60 * 10, 60 * 6, 60 * 4, 60 * 3, 60 * 2, 60, 30, 20, 15, 12, 10, 6, 5, 4, 3, 2, 1]);

      let left_sec_time = parseInt(left_time / (60 * 60 * 1000 / hour_divider)) * (60 * 60 * 1000 / hour_divider);
      let r = parseInt(right_time / (60 * 60 * 1000 / hour_divider)) * (60 * 60 * 1000 / hour_divider) + 60 * 60 * 1000 / hour_divider;
      let right_sec_time = r == right_time + 60 * 60 * 1000 / hour_divider ? right_time : r;

      let border_mode = (new Date(left_sec_time + this.getTimeOffset())).getDate() != (new Date(right_sec_time + this.getTimeOffset())).getDate();
      let seconds_before_border = left_day_time + 60 * 60 * 24 * 1000 - left_sec_time;
      let full_width = parseInt((right_sec_time - left_sec_time) / scale);
      let cols_count = parseInt((right_sec_time - left_sec_time) / (60 * 60 * 1000 / hour_divider));
      let cols_count_before = parseInt(seconds_before_border / (60 * 60 * 1000 / hour_divider));
      let col_width = 60 * 60 * 1000 / hour_divider / scale;

      let ldate = new Date(left_sec_time + this.getTimeOffset());
      let rdate = new Date(right_sec_time + this.getTimeOffset());
      let style = '';
      let style_first = 'text-align:right;';
      let t = parseInt((right_sec_time - left_sec_time - seconds_before_border) / scale);
      let style_last = 'text-align:left;';

      let text = '', text2 = ldate.getDate() + ' ' + MONTHS_NAMES[ldate.getMonth()] + ' ' + ldate.getFullYear();
      for (let ii = 0; ii < 3; ii++) text += '<div>' + text2 + '</div>';
      let text4 = '', text3 = rdate.getDate() + ' ' + MONTHS_NAMES[rdate.getMonth()] + ' ' + rdate.getFullYear();
      for (let ii = 0; ii < 3; ii++) text4 += '<div>' + text3 + '</div>';

      let onew = parseInt(((60*60*1000/hour_divider) / (60*60*1000)) * PIXELS_PER_HOUR);

      if (!border_mode)
        line1 = '<td colspan=' + cols_count + ' style="max-width:'+(onew*cols_count)+'px;' + style + '"><div style="text-align:center;">' + text + '</div></td>';
      else
        line1 = '<td colspan=' + cols_count_before + ' style="max-width:'+(onew*cols_count_before)+'px;' + style_first + '"><div>' + text + '</div></td>' +
          '<td colspan=' + (cols_count - cols_count_before) + ' style="' + style_last + '"><div>' + text4 + '</div></td>';
      let has_seconds = false;
      let prev_pos = 0;
      for (let utc = left_sec_time; utc < right_sec_time; utc += 60 * 60 * 1000 / hour_divider) {
        let next_pos = ((utc - left_sec_time + 60 * 60 * 1000 / hour_divider) / (60 * 60 * 1000)) * PIXELS_PER_HOUR;
        let hw = Math.round(next_pos - prev_pos);
        let d = new Date(utc);
        d = new Date(utc + this.getTimeOffset());
        if (!has_seconds) has_seconds = d.getSeconds() > 0;
        let datetext = d.getHours();
        if (col_width > this.min_hour_width) datetext += ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
        if (has_seconds) datetext += '<sup>:' + (d.getSeconds() < 10 ? '0' : '') + d.getSeconds() + '</sup>';
        line2 += '<td style="width:' + hw + 'px;min-width:' + hw + 'px;max-width:' + hw + 'px;">&nbsp;<div>' + datetext + '</div></td>';
        this.ranges.push([utc, hw]);
        prev_pos += hw;
      }
      this.table_left_time = left_sec_time;

      this.one_shift_time = parseInt(60 * 60 * 1000 / hour_divider);
    }

    if (seconds_frame_mode) {
      let req_frames = parseInt(this.getAttribute('frames') || 1);
      let max_frames = parseInt(PIXELS_PER_SECOND / this.min_frame_width);
      let frame_divider;
      for (frame_divider = max_frames; frame_divider > 1; frame_divider--)
        if (!(req_frames % frame_divider)) break;
      let prev_pos = 0;
      let left_seconds = new Date(left_date.getFullYear(), left_date.getMonth(), left_date.getDate(), left_date.getHours(), left_date.getMinutes(), left_date.getSeconds());
      let right_seconds = new Date(right_date.getFullYear(), right_date.getMonth(), right_date.getDate(), right_date.getHours(), right_date.getMinutes(), right_date.getSeconds());
      let i = new Date(left_seconds);
      do {
        let text = i.toLocaleTimeString() + ', ' + i.getDate() + ' ' + MONTHS_NAMES[i.getMonth()] + ' ' + i.getFullYear();
        if (screen_width < 1000 / scale) {
          let g = Math.ceil(1000 / scale / screen_width);
          let text2 = text;
          text = '';
          for (let ii = 0; ii < g; ii++)
            text += '<div>' + text2 + '</div>';
        }
        line1 += '<td colspan=' + frame_divider + '><div>' + text + '</div></td>';
        for (let frame = 0; frame < req_frames; frame += req_frames / frame_divider) {
          let next_pos = PIXELS_PER_SECOND * ((i.getTime() - left_seconds.getTime()) / 1000 + 1 / frame_divider + frame / req_frames);
          let ws = Math.round(next_pos - prev_pos);
          line2 += '<td style="width:' + ws + 'px;min-width:' + ws + 'px;max-width:' + ws + 'px;">&nbsp;<div>' + frame + '</div></td>';
          this.ranges.push([i.getTime() + 1000 / req_frames * frame, ws]);
          prev_pos += ws;
        }
      } while (i < right_seconds && i.setSeconds(i.getSeconds() + 1));
      this.table_left_time = left_seconds.getTime() - this.getTimeOffset();
      this.one_shift_time = parseInt(1000 / frame_divider);
    }
    this.setAttribute('step', this.one_shift_time);

    this.line1.innerHTML = line1;
    this.line2.innerHTML = line2;

    let wrap_shift_left = Math.floor(-screen_width / 2);
    this.wrap.style.left = '' + wrap_shift_left + 'px';
    let twrap_shift_left = -wrap_shift_left - Math.round((centerutctime - this.table_left_time) / scale - parseInt(screen_width / 2));
    this.twrap.style.marginLeft = '' + twrap_shift_left + 'px';
    this.centerpos.style.left = Math.round(screen_width / 2 - 20.5) + 'px';
    this.summary_shift = wrap_shift_left + twrap_shift_left;

    if (this.hasAttribute('databar')) {
      // this.event_getrange.time_from = parseInt(centerutctime - scale * screen_width / 2);
      // this.event_getrange.time_to = parseInt(centerutctime + scale * screen_width / 2)
      // this.event_getrange.ranges = {};
      // this.dispatchEvent(this.event_getrange);

      let event_getrange = new CustomEvent('getrange', { cancelable: true, bubbles: true, detail: {
          time_from: parseInt(centerutctime - scale * screen_width / 2),
          time_to: parseInt(centerutctime + scale * screen_width / 2),
          from_out,
          ranges: {},
          events: {},
        }});
      this.dispatchEvent(event_getrange);

      const ranges = Object.values(event_getrange.detail.ranges);
      const barCount = ranges.length;
      const mergedRanges = this.mergeTimeRanges(event_getrange.detail.ranges, this.table_left_time, right_time);

      if (barCount > 1 && this.hasAttribute('multi-databars')) {
        let html = '';
        ranges.forEach((range, i) => {
          const playerId = Object.keys(event_getrange.detail.ranges)[i];
          const events = this.getFilteredEvents(event_getrange.detail.events[playerId], this.table_left_time, right_time);
          html += `<div class="databar" style="height: 2.5px">${this.generateDataBar(range, events, scale)}</div>`;
        });
        this.databars.innerHTML = html;
        this.databars.style.height = `${2 * barCount}px`;
      } else {
        if (!mergedRanges) {
          this.databars.innerHTML = '';
        } else {
          const playerId = Object.keys(event_getrange.detail.ranges)[0];
          const events = this.getFilteredEvents(event_getrange.detail.events[playerId], this.table_left_time, right_time);
          this.databars.innerHTML = `<div class="databar">${this.generateDataBar(mergedRanges, events, scale)}</div>`;
        }
        this.databars.style.height = '4px';
      }

      const dataBarsContainer = this.shadow.querySelector('.body[multi-databars] table tr:first-child td');
      if (dataBarsContainer) {
        dataBarsContainer.style.height = `${Math.max(20, 14 + 2 * barCount)}px`;
      }

      if (mergedRanges && !mergedRanges.hasVideo && mergedRanges.nextTime) {
        self.event_skip.time = mergedRanges.nextTime;
        self.dispatchEvent(self.event_skip);
      }
    }

    if (this.getAttribute('selectutctime') !== null) {
      let selectutctime = parseInt(this.getAttribute('selectutctime'));
      let lt = centerutctime > selectutctime ? selectutctime : centerutctime;
      let mar_left = parseInt(this.getBoundingClientRect().width / 2 - (centerutctime - lt) / scale) - wrap_shift_left - twrap_shift_left;
      let range_width = (centerutctime > selectutctime ? centerutctime - selectutctime : selectutctime - centerutctime) / scale;
      this.shadow.querySelector('.range').style.width = '' + range_width + 'px';
      this.shadow.querySelector('.range').style.marginLeft = '' + mar_left + 'px';
      this.shadow.querySelector('.range').style.display = 'block';
    } else
      this.shadow.querySelector('.range').style.display = 'none';

    if (!from_out) {
      setTimeout(function () {
        let event_change = new Event('change', { cancelable: false, bubbles: true });
        event_change.time = self.getAttribute('centerutctime');
        self.dispatchEvent(event_change);
      }, 0);
    }
  }

  mergeTimeRanges(playerRanges, leftTime, rightTime) {
    const ranges = Object.values(playerRanges).filter((item) => item.times?.length);
    if (!ranges.length) {
      return null;
    }

    const now = Number(this.getAttribute('centerutctime')) || Date.now();
    let hasVideo = false;
    let nextTime;
    ranges.forEach((range) => {
      if (!hasVideo) {
        for (let i = 0; i < range.times.length; i++) {
          const st = range.times[i];
          const et = st + Math.abs(range.durations[i]);
          if (st <= now && et >= now) {
            hasVideo = range.durations[i] > 0;
            break;
          }
        }
      }

      const nt = range.times.find((t, i) => (
        t > now && range.durations[i] > 0
      ));
      if (!nextTime || nt < nextTime) {
        nextTime = nt;
      }
    });

    let times = [];
    ranges.forEach((range) => {
      let start = 0, end;
      for (let i = 0; i < range.times.length; i++) {
        if (range.times[i] < leftTime) start = i;
        if (range.times[i] >= rightTime) {
          end = i;
          break;
        }
      }
      if (end === undefined) {
        end = range.times.length;
      }
      range.times = range.times.slice(start, end);
      range.durations = range.durations.slice(start, end);

      times.push(...range.times);
    });
    times = [...new Set(times)].sort();

    const indexes = ranges.map(() => 0);
    const durations = [];
    const count = times.length;
    for (let i = 0; i < count; i++) {
      const currentTime = times[i];
      const nextTime = times[i + 1] ?? rightTime;
      const duration = nextTime - currentTime;
      let hasData = false;
      ranges.forEach((range, j) => {
        while (indexes[j] < range.times.length - 1 && range.times[indexes[j] + 1] <= currentTime) {
          indexes[j] ++;
        }
        if (range.durations[indexes[j]] > 0) {
          hasData = true;
        }
      });
      durations.push(duration * (hasData ? 1 : -1));
    }

    return {
      times,
      durations,
      hasVideo,
      nextTime,
    };
  }

  getFilteredEvents(events, startTime, endTime) {
    if (!events || !Object.keys(events).length) {
      return [];
    }
    const filteredEvents = Object.values(events)
      .filter((e) => startTime <= e.timestamp && e.timestamp <= endTime)
      .sort((a, b) => a.timestamp - b.timestamp);
    if (filteredEvents.length <= this.display_events_count) {
      return filteredEvents;
    }
    const totalCount = filteredEvents.length;
    const result = [];
    for (let i = 0; i < this.display_events_count; i ++) {
      const index = Math.floor(i * totalCount / this.display_events_count);
      result.push(filteredEvents[index]);
    }
    return result;
  }

  generateDataBar(ranges, events, scale) {
    let html = '';
    let prevPos = 0;
    const now = Date.now();
    for (let i = 0; i < ranges.times.length; i++) {
      let st = parseInt((ranges.times[i] - this.table_left_time) / scale);
      if (st < 0) st = 0;
      if (st >= now) continue;

      let et = ranges.times[i] + Math.abs(ranges.durations[i]);
      if (et > now) {
        et = now;
      }
      et = parseInt((et - this.table_left_time) / scale);
      let w = et - st;
      let n = st - prevPos;
      if (w < 0) {
        n += w;
        w = 0;
      }
      html += `<div ${ranges.durations[i] < 0 ? 'e' : ''} style="width: ${w}px; margin-left: ${n}px;"></div>`;
      prevPos = et;
    }
    events.forEach((e) => {
      let st = (e.timestamp - this.table_left_time) / scale;
      if (st < 0) return;

      html += `<k-event-mark id="${e.id}" name="${e.name}" thumbnail="${e.thumb?.url}" timestamp="${new Date(e.timestamp).toLocaleString()}" style="left: ${st}px"></k-event-mark>`;
    });
    return html;
  }

  getTimeOffset() {
    let utc = this.getAttribute('utc');
    let centerutctime = Number(this.getAttribute('centerutctime')) || Date.now();
    if (utc !== null) return (new Date(centerutctime).getTimezoneOffset()) * 60 * 1000 + parseInt(utc) * 60 * 60 * 1000;
    return 0;
  }

  roundDayDown(utctime) {
    let d = new Date(utctime + this.getTimeOffset());
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime() - this.getTimeOffset();
  }

  roundDayUp(utctime) {
    let d = new Date(utctime + this.getTimeOffset());
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0).getTime() - this.getTimeOffset();
  }

  getYearSeconds(year) {
    let utc1 = Date.UTC(year, 0, 1, 0, 0, 0);
    let utc2 = Date.UTC(year + 1, 0, 1, 0, 0, 0);
    return parseInt((utc2 - utc1));
  }

  getMonthSeconds(year, month) {
    let utc1 = Date.UTC(year, month, 1, 0, 0, 0);
    let utc2 = Date.UTC(year, month + 1, 1, 0, 0, 0);
    return parseInt((utc2 - utc1));
  }

  getDaysInMonth(year, month) {
    let utc1 = Date.UTC(year, month, 1, 0, 0, 0);
    let utc2 = Date.UTC(year, month + 1, 1, 0, 0, 0);
    return parseInt((utc2 - utc1) / 1000 / 24 / 60 / 60);
  }

  textWidth(text, fontSize, fontFamily) {
    let el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.float = "left";
    el.style.whiteSpace = 'nowrap';
    el.style.visibility = 'hidden';
    el.style.fontSize = fontSize ? fontSize : this.style.fontSize;
    el.style.fontFamily = fontFamily ? fontFamily : this.style.fontFamily;
    el.innerHTML = text;
    if (!document.body) return 0;
    el = document.body.appendChild(el);
    let w = el.offsetWidth;
    document.body.removeChild(el);
    return w;
  }

  getRanges() {
    return this.ranges !== undefined ? this.ranges : [];
  }

  getSummaryShift() {
    return this.summary_shift ? this.summary_shift : 0;
  }

  static get css() {
    return `
      <style>
        table {
           border-spacing: 0px;
           height:100%;
           min-height:3em;
           color:inherit;
           font-size:inherit;
        }
        table tr td { 
          padding:0;
        }
        .body:not(:not([databar])) table tr:first-child td {
            padding-bottom:3px;
        }
        .body:not([databar]) .databars {
            display:none;
        }
        .databars {
            text-align: left;
            height: 4px;
            position: absolute;
            min-width: 100%;
            display: block;
            top: 1em;
            z-index: 20;
            line-height: 0;
            background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAAXNSR0IB2cksfwAAAAZQTFRF////AAAAVcLTfgAAAAJ0Uk5TZmbh5cV0AAAADElEQVR4nGNwYGgAAAFEAME6ehxWAAAAAElFTkSuQmCC);
        }
        table tr:first-child td {
            box-shadow: 1px 0 0 white;
            vertical-align: top;
            height: 1em;
        }
        .body[multi-databars] table tr:first-child td {
            height: 20px;
        }
        .body:not([databar]) table tr:first-child td {
            height:1.2em;
        }
        table tr:first-child td:first-child > div {
            text-align:right;
        }
        table tr:first-child td:last-child > div {
            text-align:left;
        }
        table tr:first-child td > div {
            padding: 0px 3px;
            text-align: center;
            height: 1.1em;
            overflow: hidden;
            white-space: nowrap;
            display: flex;
            flex-direction: row;
            align-content: space-between;
            justify-content: space-between;
        }
        table tr:last-child td > div {
            height: 1.2em;
            word-break: break-all;
            overflow: hidden;
            width: 100%;
            position: absolute;
            text-align: center;
            bottom: 3px;
            left: -50%;
        }
        table tr:last-child td {
            height: min-content;
            text-align: left;
            vertical-align: middle;
            position: relative;
        }
        table tr:last-child td.year {
            border-left: 1px solid gray;
            border-top: 2px solid gray;
        }
        .body:not([databar]) table tr:last-child td:not(.year) {
            border-top:2px solid gray;
        }
        table tr:last-child td:not(.year):before {
            margin-left: 0;
            content: '';
            width: 0;
            height: 5px;
            border-left: 1px solid;
            position: absolute;
            bottom: 22px;
            border-left-color: inherit;
        }
        table tr:last-child td.odd {
            background-color:#80808040;
        }
        table td sup { 
            vertical-align:baseline;
        }
        .centerpos {
            width: 41px;
            background: linear-gradient(90deg, #0000, #0000 40%,#0000 45%, #f88f 49%,#0000 50%, #f88f 51%, #0000 55%, #0000 60%, #0000);
            height: 100%;
            position: absolute;
            left: calc(50% - 20.5px) ;
            top: 0;
            z-index: 30;
        }
        .centerpos div {
            margin: 0 auto;
            width: 1px;
            height: 100%;
            background:red;
        }
        * {
            -moz-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        .body {
            position: relative;
            overflow: hidden;
            width: 100%;
            height: 100%;
            line-height: 1;
        }
        .wrap {
            position: absolute;
            left: -50%;
            height: 100%;
            right:-50%;
        }
        .twrap { 
            position: absolute;
            height:100%;
        }
        .databar {
            position: relative;
            height: 4px;
            display: flex;
            line-height: 0;
        }
        .databar > [e] {
            background-color:black;
        }
        .databar > :not([e]) { 
            box-shadow:-1px 0 1px #00000080;
        }
        .databar > div {
            height: 100%;
            background-color: white;
            margin-top: 1px;
            display: inline-block;
        }
        .databar > div.e {
            background-color:white;
        }
        .databar > k-event-mark {
          display: block;
          position: absolute;
          top: 50%;
          z-index: 50;
          width: 4px;
          height: calc(100% + 3px);
          background: #dc3545;
          border-radius: 2px;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
        .range { 
            height: 40px;
            background-color: #f888;
            margin-top: 1px;
            position: absolute;
        }
      </style>
    `;
  }

}

window.customElements.define('k-timeline-picker', CTimeLinePicker);
class CKMultiplayerController extends HTMLElement {

  static get observedAttributes() {
    return ['mode'];
  }

  constructor() {
    super();

    this.isPlaying = false;
    this.canPlay = false;
    this.allLoading = false;

    this.mode = 'live';

    this.players = [];              // all players
    this.availablePlayers = [];     // available players (with valid token)

    this.playtime = Date.now();
    this.playtimeDiff = 0;
    this.timer = null;
    this.syncCounter = 0;
    this.syncMaxCount = 3;

    this.eventModeChange = new Event('modeChange', {cancelable: false, bubbles: true});
  }

  connectedCallback() {
    let self = this;
    self.style.display = 'block';

    this.shadow = this.attachShadow({
      mode: 'open'
    });

    const utc = self.getAttribute('utc');
    let params = '';
    if (utc) {
      params += ` utc="${utc}"`;
    }
    if (self.hasAttribute('multi-databars')) {
      params += ' multi-databars';
    }
    self.mode = self.getAttribute('mode') || 'live';
    self.playtime = Number(self.getAttribute('playtime')) || Date.now();
    self.controlSwitch = (self.getAttribute('control_mode_switch') == "hidden") ? false : true;
    self.controlFullscreen =  (self.getAttribute('control_fullscreen') == "hidden") ? false : true; 

   var t =   `<div class="body">
    <div class="control-bar">
      <div class="controllers">
        <k-control-time-seek></k-control-time-seek>
      </div>
      <div class="datetime-picker">
        <div class="label"></div>
        <input id="picker" readonly />
      </div>
      <div class="controllers"> 
        <k-control-play></k-control-play>
      `;
      if (self.controlSwitch)
        t += `
        <k-control-fullscreen></k-control-fullscreen>
        `;
      if  (self.controlFullscreen)
        t += `
        <k-control-mode-switch mode="${self.mode}"></k-control-mode-switch>
        `;
        t += `
        </div>
      </div>
      <div class="timeline">
        <k-timeline-picker databar frames="25" scale="600" maxscale="2660" minscale="12" maxtime="+600000" centerutctime="${self.playtime}" ${params}></k-timeline-picker>
      </div>
    </div>
  `;
  this.shadow.innerHTML = CKMultiplayerController.css + t;   
  

    setTimeout(() => {
      self.initControls();
    }, 100);
  }

  disconnectedCallback() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  initControls() {
    const self = this;

    self.root = this.shadow.querySelector('.body');
    self.root.setAttribute('mode', self.mode);

    self.timeSeekBar = this.shadow.querySelector('k-control-time-seek');
    self.timeSeekBar.addEventListener('seek', (e) => {
      const offset = e.offset;
      self.forceSeek(self.playtime + offset);
    });
    self.timeSeekBar.addEventListener('skipToFirst', () => {
      Promise.all(
        self.availablePlayers.map((player) => (
          player.player.getFirstStorageData().then((res) => res.objects?.[0]).catch(() => null)
        ))
      ).then((results) => {
        const times = results
          .filter((result) => result?.start)
          .map((result) => new Date(`${result.start.substring(0, 19)}.000Z`).getTime());
        if (times.length) {
          try {
            self.forceSeek(Math.min(...times));
            self.onPause();
          } catch {}
        }
      });
    });
    self.timeSeekBar.addEventListener('skipToLast', () => {
      self.forceSeek(Date.now() - 2 * 60 * 1000); // 2 minutes ago
      self.onPause();
    });

    self.playBtn = this.shadow.querySelector('k-control-play');
    self.playBtn.button.onclick = function () {
      if (!self.isPlaying) {
        self.onPlay();
      } else {
        self.onPause();
      }
    };


    if (self.controlSwitch)
    {
      self.modeSwitch = this.shadow.querySelector('k-control-mode-switch');
      self.modeSwitch.addEventListener('change', (e) => {
        self.setMode(e.mode);
      });
    }
   
    self.datepicker = new AirDatepicker(this.shadow.querySelector('.datetime-picker #picker'), {
      locale: {
        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        today: 'Today',
        clear: 'Clear',
        dateFormat: 'mm/dd/yyyy',
        timeFormat: 'hh:ii aa',
        firstDay: 0
      },
      position: 'top right',
      timepicker: true,
      timeFormat: 'hh:mm AA',
      maxDate: new Date(),
      buttons: [
        {
          content() {
            return 'Today';
          },
          onClick(dp) {
            const value = Date.now();
            self.onPause();
            self.forceSeek(value);
            dp.hide();
          }
        },
        {
          content() {
            return 'Set';
          },
          onClick(dp) {
            const date = dp.selectedDates[0];
            if (!date) {
              return;
            }

            const value = date.getTime() - self.getTimezoneOffset();
            self.onPause();
            self.forceSeek(value);
            dp.hide();
          }
        }
      ],
      onShow(isFinished) {
        if (!isFinished) {
          const date = new Date(self.playtime + self.getTimezoneOffset());
          self.datepicker.selectDate(date, {
            updateTime: true,
            silent: true,
          });
        }
      },
    });
    self.datepickerLabel = this.shadow.querySelector('.datetime-picker .label');

    this.setPlaytime(self.playtime);

    self.timeline = this.shadow.querySelector('k-timeline-picker');

    self.timeline.addEventListener("moving", function () {
      self.onPause();
    }, {once: false});

    self.timeline.addEventListener("change", function () {
      self.seekTime = Number(self.timeline.getAttribute('centerutctime'));
      self.onPause();
    }, {once: false});

    self.timeline.addEventListener("skip", function (e) {
      if (!self.isPlaying) {
        return;
      }

      self.setPlaytime(e.time);
      self.seekTime = e.time;
      self.playtimeDiff = Date.now() - self.playtime;
      self.syncCounter = 0;
    }, {once: false});
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let self = this;

    if (name === 'mode') {
      self.setMode(newValue);
    }
  }

  init() {
    let self = this;

    self.syncCounter = 0;
    self.playerStatus = {};
    setTimeout(() => {
      self.players = [...document.querySelectorAll('vxg-cloud-player').values()];
      self.players.forEach((player) => {
        player.player.disableAutoSkip = true;
        self.playerStatus[player.id] = player.getAttribute('status');
        player.player.addEventListener("statusupdate", function (event) {
          self.playerStatus[player.id] = event.status;
          self.updatePlayerStatus();
        }, { once: false });
      });

      self.updatePlayerStatus();
      self.shadow.querySelector('.timeline').style.height = `${Math.max(52, 44 + self.players.length * 2.5)}px`;
    }, 0);

    if (self.timer) {
      clearInterval(self.timer);
    }
    self.timer = setInterval(this.onTimeout.bind(this), 300);
  }

  updatePlayerStatus() {
    const invalidStatus = ['invalidtoken'];
    const loadingStatus = ['loading', 'seeking'];
    const playableStatus = ['playing', 'pause'];
    const statuses = Object.values(this.playerStatus);

    this.availablePlayers = this.players.filter((player) => this.playerStatus[player.id] && !invalidStatus.includes(this.playerStatus[player.id]));
    if (!this.availablePlayers.length) {
      this.enablePlayButton(false);
      this.onPause();
      return;
    }

    const hasLoading = statuses.some((status) => loadingStatus.includes(status));
    const hasPlayable = statuses.some((status) => playableStatus.includes(status));
    this.allLoading = hasLoading && !hasPlayable;
    if (this.allLoading) {
      this.enablePlayButton(false);
      return;
    }

    if (hasPlayable) {
      this.enablePlayButton(true);
      return;
    }

    // all players are in nodata status
    const hasVideoData = this.players.some((player) => player.timepicker.hasNextVideoData());
    this.enablePlayButton(hasVideoData);
  }

  setPlaytime(time) {
    this.playtime = time;
    this.setAttribute('playtime', time);

    if (this.datepickerLabel) {
      const date = new Date(this.playtime + this.getTimezoneOffset());
      const options = {
        weekday: 'short', // abbreviated day of the week (e.g., "Tue")
        day: '2-digit', // two-digit day of the month (e.g., "15")
        month: 'short', // abbreviated month (e.g., "Mar")
        hour: '2-digit', // two-digit hour (e.g., "12")
        minute: '2-digit', // two-digit minute (e.g., "10")
        second: '2-digit' // two-digit second (e.g., "35")
      };

      const formatter = new Intl.DateTimeFormat(navigator.language || navigator.userLanguage || 'en-US', options);
      this.datepickerLabel.textContent = formatter.format(date);
    }
  }

  forceSeek(time) {
    this.setPlaytime(time);
    this.seekTime = time;
    this.playtimeDiff = Date.now() - this.playtime;
    this.syncCounter = 0;
    this.timeline.setAttribute('centerutctime', time);
  }

  enablePlayButton(enabled) {
    this.canPlay = enabled;
    if (this.playBtn) {
      this.playBtn.button.classList.toggle('disabled', !enabled);
    }
  }

  onPlay() {
    if (this.isPlaying) {
      return;
    }

    const self = this;
    self.isPlaying = true;
    self.playtimeDiff = Date.now() - self.playtime;
    self.syncCounter = 0;

    self.availablePlayers.forEach((player) => {
      player.play().catch(function () {});
    });
    self.playBtn.onPlay();
  }

  onPause() {
    if (!this.isPlaying) {
      return;
    }

    const self = this;
    self.isPlaying = false;
    self.availablePlayers.forEach((player) => {
      player.pause().catch(function () {});
    });
    self.playBtn.onPause();
  }

  onTimeout() {
    if (this.mode === 'live') {
      this.setPlaytime(Date.now());
      this.timeline.setAttribute('centerutctime', Date.now());
      return;
    }

    if (this.seekTime) {
      this.seekTo(this.seekTime);
      delete this.seekTime;
      return;
    }

    if (!this.isPlaying || !this.canPlay || this.allLoading) {
      return;
    }

    const self = this;
    const playtime = Date.now() - self.playtimeDiff;
    this.setPlaytime(playtime);
    self.timeline.setAttribute('centerutctime', playtime);

    self.syncCounter --;
    if (self.syncCounter <= 0) {
      self.syncTime();
    }
  }

  seekTo(time) {
    this.setPlaytime(time);
    this.syncTime(100);
  }

  syncTime(threshold = 500, force = false) {
    const self = this;
    self.syncCounter = self.syncMaxCount;
    const step = Number(self.timeline.getAttribute('step'));

    self.availablePlayers.forEach((player) => {
      const diff = Math.abs(player.currentUtcTime - self.playtime);
      if (diff < threshold) {
        return;
      }

      player.currentUtcTime = self.playtime;
      player.sendTimeUpdate();

      if (!isNaN(step)) {
        player.player.storage.posters_cache.autoPreload(self.playtime, step);
      }

      if (!force && self.isPlaying && player.timepicker && !player.timepicker.hasVideoData()) {
        return;
      }

      if (self.isPlaying) {
        player.play();
      }
    });
  }

  getTimezoneOffset() {
    if (!this.hasAttribute('utc')) {
      return 0;
    }
    const utc = Number(this.getAttribute('utc')) || 0;
    return utc * 60 * 60 * 1000 + new Date(this.playtime).getTimezoneOffset() * 60 * 1000;
  }

  setMode(mode) {
    if (mode === this.mode) {
      return;
    }
    this.mode = mode;
    this.eventModeChange.mode = mode;
    this.dispatchEvent(this.eventModeChange);
    this.setAttribute('mode', mode);
    this.root?.setAttribute('mode', mode);
    if (self.controlSwitch)
      this.modeSwitch?.setAttribute('mode', mode);
  }

  static get css() {
    return `
      <style>
        * {
          -moz-user-select: none;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
          box-sizing: border-box;
        }
        .body {
          position: relative;
          width: 100%;
          background: black;
          color: white;
        }
        .control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #222;
          padding: 8px;
        }
        .timeline {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 52px;
          padding: 0 8px;
          border-top: 1px solid #333;
        }
        k-timeline-picker {
          flex: 1;
          height: 100%;
        }
        
        k-control-time-seek {
          width: auto !important;
          flex-shrink: 0;  
        }
        .datetime-picker {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          overflow: hidden;
          transition: all ease-in-out 0.1s;
          cursor: pointer;
        }
        .datetime-picker .label {
          font-size: 1.125em;
          white-space: nowrap;
        }
        .datetime-picker:hover {
          transform: scale(1.05);
        }
        .datetime-picker #picker {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        
        .controllers {
          width: 250px;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .controllers:last-child {
          justify-content: flex-end;
        }
        
        k-control-fullscreen, k-control-play {
          width: 24px !important;
          height: 24px !important;
          flex-shrink: 0;
        }
        k-control-mode-switch {
          width: 152px !important;
        }
        
        .body[mode=live] k-control-time-seek,
        .body[mode=live] k-control-play {
          display: none !important;
        }
        .body[mode=live] .timeline {
          display: none;
        }
      </style>
    `;
  }

}

window.customElements.define('k-multiplayer-controller', CKMultiplayerController);
class CKControl extends HTMLElement {
  getType() {
    return 'min';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    let self = this;
  }

  connectedCallback() {
    let self = this;
    this.style.position = 'relative';
    this.style.width = '100%';
    this.style.height = '100%';
    this.style.display = 'block';
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = '<style>' + this.css() + '</style>';
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  setPlayer(player) {
    this.player = player;
  }

  css() {
    return ``;
  }

  setRedux(redux) {
    this.redux = redux;
  }
}

window.customElements.define('k-control', CKControl);
class CKControlFullscreen extends CKControl {
  getType() {
    return 'min';
  }

  static get observedAttributes() {
    return [];
  }

  customFullScreen(shouldOpen) {
    if (!this.player) {
      const container = document.querySelector('.players-container');
      if (container) {
        if (shouldOpen === undefined) {
          shouldOpen = !container.classList.contains('fullscreen');
        }
        container.classList.toggle('fullscreen', shouldOpen);
        if (shouldOpen) {
          document.body.style.overflow = 'hidden';
          this.openFullscreen();
        } else {
          document.body.style.overflow = 'auto';
          this.closeFullscreen();
        }
      }
      return;
    }

    if (shouldOpen === undefined) {
      shouldOpen = !this.player.classList.contains('fullscreen');
    }
    if (!shouldOpen) {
      this.player.classList.remove('fullscreen');
      let p = document.getElementById('fullscreenstyle');
      if (p) p.remove();
      return;
    }
    if (document.getElementById('fullscreenstyle') === null)
      document.body.insertAdjacentHTML('beforeend', '<div id="fullscreenstyle"><style>body{overflow:hidden!important;}body .fullscreen{position:fixed!important;left:0!important;right:0!important;top:0!important;bottom:0!important;z-index:2000000!important;width:100%!important;height:100%!important;}</style></div>')
    this.player.classList.add('fullscreen');
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    let self = this;
    this.shadow.innerHTML += '<div class="fsbtn"></div>';
    this.shadow.querySelector('.fsbtn').onclick = function () {
      self.customFullScreen();
    }

    document.addEventListener('fullscreenchange', function () {
      if (!document.fullscreenElement) {
        self.customFullScreen(false);
      }
    });
  }

  onPlay() {
  }

  onPause() {
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  openFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen();
    }
  }

  closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }

  css() {
    return super.css() + `
      .fsbtn {
        height: 100%;
        width: 100%;
        background: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+CjxwYXRoIGQ9Ik0xMjgsMzJWMEgxNkM3LjE2MywwLDAsNy4xNjMsMCwxNnYxMTJoMzJWNTQuNTZMMTgwLjY0LDIwMy4ybDIyLjU2LTIyLjU2TDU0LjU2LDMySDEyOHoiIGZpbGw9IiNmZmYiLz4KPHBhdGggZD0iTTQ5NiwwSDM4NHYzMmg3My40NEwzMDguOCwxODAuNjRsMjIuNTYsMjIuNTZMNDgwLDU0LjU2VjEyOGgzMlYxNkM1MTIsNy4xNjMsNTA0LjgzNywwLDQ5NiwweiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNDgwLDQ1Ny40NEwzMzEuMzYsMzA4LjhsLTIyLjU2LDIyLjU2TDQ1Ny40NCw0ODBIMzg0djMyaDExMmM4LjgzNywwLDE2LTcuMTYzLDE2LTE2VjM4NGgtMzJWNDU3LjQ0eiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNMTgwLjY0LDMwOC42NEwzMiw0NTcuNDRWMzg0SDB2MTEyYzAsOC44MzcsNy4xNjMsMTYsMTYsMTZoMTEydi0zMkg1NC41NkwyMDMuMiwzMzEuMzZMMTgwLjY0LDMwOC42NHoiIGZpbGw9IiNmZmYiLz4KPC9nPgo8L3N2Zz4K) no-repeat;
        background-size: 70%;
        background-position: center;
        transition-property: background-size;transition-duration: .1s;
      }
      .fsbtn:hover {
        transition-property: background-size;transition-duration: .1s;
        background-size: 80%;
        cursor:pointer;
      }
    `;
  }
}

window.customElements.define('k-control-fullscreen', CKControlFullscreen);
class CKControlPlay extends CKControl {
  getType() {
    return 'min';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    let self = this;
    this.shadow.innerHTML += '<div class="playbtn"></div>';
    self.button = this.shadow.querySelector('.playbtn');

    setTimeout(function () {
      if (!self.player) {
        return;
      }

      self.button.onclick = function () {
        if (!self.isPlaying())
          self.player.play().catch(function () {});
        else
          self.player.pause().catch(function () {});
      };
      self.player.player.addEventListener("statusupdate", function (event) {
        if (event.status === 'invalidtoken')
          self.button.classList.add('disabled');
        else if (event.status !== 'loading')
          self.button.classList.remove('disabled');
      }, {once: false});
    }, 0);
  }

  onPlay() {
    if (!this.isPlaying())
      this.button.classList.add('pause');
  }

  onPause() {
    if (this.isPlaying())
      this.button.classList.remove('pause');
  }

  isPlaying() {
    return this.button.classList.contains('pause');
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  css() {
    return super.css() + `
      .playbtn.disabled {
        pointer-events:none;
      }
      .playbtn {
        width: 100%;
        height: 100%;
        background: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yMyAxMmwtMjIgMTJ2LTI0bDIyIDEyem0tMjEgMTAuMzE1bDE4LjkxMi0xMC4zMTUtMTguOTEyLTEwLjMxNXYyMC42M3oiIGZpbGw9IiNmZmZmZmYiLz48L3N2Zz4=) no-repeat;
        background-size: 70%;
        background-position: center;
        transition-property: background-size;transition-duration: .1s;
      }
      .playbtn:hover {
        transition-property: background-size;transition-duration: .1s;
        background-size: 80%;
        cursor:pointer;
      }
      .playbtn.pause {
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDMxNCAzMTQiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDMxNCAzMTQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik05MS40NywwSDc1LjM0M0M1OC41MzgsMCw0NC44NjcsMTMuNjcxLDQ0Ljg2NywzMC40NzZ2MjUzLjA0OGMwLDE2LjgwNSwxMy42NzEsMzAuNDc3LDMwLjQ3NiwzMC40NzdIOTEuNDcNCgkJYzE2LjgwNSwwLDMwLjQ3Ny0xMy42NzIsMzAuNDc3LTMwLjQ3N1YzMC40NzZDMTIxLjk0NiwxMy42NzEsMTA4LjI3NCwwLDkxLjQ3LDB6IE0xMDcuOTQ2LDI4My41MjMNCgkJYzAsOS4wODUtNy4zOTIsMTYuNDc3LTE2LjQ3NywxNi40NzdINzUuMzQzYy05LjA4NSwwLTE2LjQ3Ni03LjM5Mi0xNi40NzYtMTYuNDc3VjMwLjQ3NkM1OC44NjcsMjEuMzkxLDY2LjI1OCwxNCw3NS4zNDMsMTRIOTEuNDcNCgkJYzkuMDg1LDAsMTYuNDc3LDcuMzkxLDE2LjQ3NywxNi40NzZWMjgzLjUyM3oiIGZpbGw9IiNmZmZmZmYiLz4NCgk8cGF0aCBkPSJNMjM4LjY1NywwSDIyMi41M2MtMTYuODA1LDAtMzAuNDc3LDEzLjY3MS0zMC40NzcsMzAuNDc2djI1My4wNDhjMCwxNi44MDUsMTMuNjcyLDMwLjQ3NywzMC40NzcsMzAuNDc3aDE2LjEyNw0KCQljMTYuODA1LDAsMzAuNDc2LTEzLjY3MiwzMC40NzYtMzAuNDc3VjMwLjQ3NkMyNjkuMTMzLDEzLjY3MSwyNTUuNDYyLDAsMjM4LjY1NywweiBNMjU1LjEzMywyODMuNTIzDQoJCWMwLDkuMDg1LTcuMzkxLDE2LjQ3Ny0xNi40NzYsMTYuNDc3SDIyMi41M2MtOS4wODUsMC0xNi40NzctNy4zOTItMTYuNDc3LTE2LjQ3N1YzMC40NzZjMC05LjA4NSw3LjM5Mi0xNi40NzYsMTYuNDc3LTE2LjQ3Ng0KCQloMTYuMTI3YzkuMDg1LDAsMTYuNDc2LDcuMzkxLDE2LjQ3NiwxNi40NzZWMjgzLjUyM3oiIGZpbGw9IiNmZmZmZmYiLz4NCjwvZz4NCjwvc3ZnPg0K);
      }
    `;
  }
}

window.customElements.define('k-control-play', CKControlPlay);
class CKControlTimeSeek extends CKControl {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();

    this.timeOptions = [
      { label: '5 minutes', value: 5 * 60 * 1000 },
      { label: '30 minutes', value: 30 * 60 * 1000 },
      { label: '1 hour', value: 60 * 60 * 1000 },
      { label: '2 hours', value: 2 * 60 * 60 * 1000 },
      { label: '6 hours', value: 6 * 60 * 60 * 1000 },
      { label: '12 hours', value: 12 * 60 * 60 * 1000 },
      { label: '1 day', value: 24 * 60 * 60 * 1000 },
      { label: '1 week', value: 7 * 24 * 60 * 60 * 1000 },
      { label: '1 month', value: 30 * 24 * 60 * 60 * 1000 },
    ];
    this.selectedTimeOption = this.timeOptions[2];

    this.eventSeek = new Event('seek', {cancelable: false, bubbles: true});
    this.eventSkipToFirst = new Event('skipToFirst', {cancelable: false, bubbles: true});
    this.eventSkipToLast = new Event('skipToLast', {cancelable: false, bubbles: true});
  }

  connectedCallback() {
    super.connectedCallback();

    let self = this;
    this.shadow.innerHTML += `
      <div class="body">
        <div class="btn first-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6zm6.5 2.14L12.97 12 16 9.86z"></path>
          </svg>
        </div>
        <div class="btn backward-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path d="M18 9.86v4.28L14.97 12zm-9 0v4.28L5.97 12zM20 6l-8.5 6 8.5 6zm-9 0-8.5 6 8.5 6z"></path>
          </svg>
        </div>
        <div class="time-select">
          <div class="select-box">${this.selectedTimeOption.label}</div>
          <div class="dropdown">
            ${this.timeOptions.map((option) => `
              <div class="item" data-value="${option.value}">${option.label}</div>
            `).join('\n')}
          </div>
        </div>
        <div class="btn forward-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path d="M15 9.86 18.03 12 15 14.14zm-9 0L9.03 12 6 14.14zM13 6v12l8.5-6zM4 6v12l8.5-6z"></path>
          </svg>
        </div>
        <div class="btn last-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <path d="m6 18 8.5-6L6 6zm2-8.14L11.03 12 8 14.14zM16 6h2v12h-2z"></path>
          </svg>
        </div>
      </div>
    `;
    self.firstBtn = this.shadow.querySelector('.first-btn');
    self.lastBtn = this.shadow.querySelector('.last-btn');
    self.backwardBtn = this.shadow.querySelector('.backward-btn');
    self.forwardBtn = this.shadow.querySelector('.forward-btn');
    self.timeSelect = this.shadow.querySelector('.time-select');

    const timeSelectLabel = self.timeSelect.querySelector('.select-box');
    self.timeSelect.querySelectorAll('.dropdown .item').forEach((el) => {
      const label = el.textContent;
      const option = self.timeOptions.find((option) => option.label === label);
      el.onclick = () => {
        self.selectedTimeOption = option;
        timeSelectLabel.innerHTML = label;
      };
    });

    self.backwardBtn.onclick = () => {
      self.eventSeek.offset = -self.selectedTimeOption.value;
      self.dispatchEvent(self.eventSeek);
    };
    self.forwardBtn.onclick = () => {
      self.eventSeek.offset = self.selectedTimeOption.value;
      self.dispatchEvent(self.eventSeek);
    };
    self.firstBtn.onclick = () => {
      self.dispatchEvent(self.eventSkipToFirst);
    };
    self.lastBtn.onclick = () => {
      self.dispatchEvent(self.eventSkipToLast);
    };
  }

  css() {
    return super.css() + `
      .body {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: 12px;
      }
      
      .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        cursor: pointer;
      }
      .btn svg {
        fill: currentColor;
      }
      .btn:hover {
        transform: scale(1.2);
      }
      
      .time-select {
        position: relative;
        width: 80px;
      }
      .time-select .select-box {
        text-align: center;
        padding: 4px 0;
        cursor: pointer;
      }
      .time-select .dropdown {
        position: absolute;
        top: 0;
        z-index: 100;
        width: 100px;
        background: #222;
        border: 1px solid #333;
        padding: 4px 0;
        transform: translateY(-100%);
      }
      .time-select:not(:hover) .dropdown {
        display: none;
      }
      .time-select .dropdown .item {
        padding: 2px 8px;
        cursor: pointer;
      }
      .time-select .dropdown .item:hover {
        background: black;
      }
    `;
  }
}

window.customElements.define('k-control-time-seek', CKControlTimeSeek);
class CKControlModeSwitch extends CKControl {

  static get observedAttributes() {
    return ['mode'];
  }

  constructor() {
    super();

    this.mode = 'live';
    this.event_change = new Event('change', {cancelable: false, bubbles: true});
  }

  connectedCallback() {
    super.connectedCallback();

    let self = this;
    const defaultMode = self.getAttribute('mode') || 'live';
    self.mode = defaultMode;
    this.shadow.innerHTML += `
      <div class="body">
        <button class="${defaultMode === 'recorded' ? 'active' : ''}" data-mode="recorded">Recorded</button>
        <button class="${defaultMode === 'live' ? 'active' : ''}" data-mode="live">Live</button>
      </div>
    `;
    const buttons = this.shadow.querySelectorAll('button');
    self.recordedButton = buttons[0];
    self.liveButton = buttons[1];

    buttons.forEach((button) => {
      button.onclick = () => {
        const mode = button.getAttribute('data-mode');
        if (mode === self.mode) {
          return;
        }
        self.event_change.mode = mode;
        self.setMode(mode);
        self.dispatchEvent(self.event_change);
      };
    });
  }

  setMode(mode) {
    if (mode === this.mode) {
      return;
    }
    this.mode = mode;
    this.liveButton?.classList?.toggle('active', mode === 'live');
    this.recordedButton?.classList?.toggle('active', mode === 'recorded');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let self = this;

    if (name === 'mode') {
      self.setMode(newValue);
    }
  }

  css() {
    return super.css() + `
      .body {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      
      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 76px;
        background: transparent;
        color: white;
        border: 1px solid white;
        font-weight: bold;
        padding: 2px 4px;
        outline: none;
        cursor: pointer;
      }
      button:first-child {
        border-radius: 16px 0 0 16px;
      }
      button:last-child {
        border-radius: 0 16px 16px 0;
        border-left: 0;
      }
      button.active {
        background: white;
        color: #222;
      }
    `;
  }
}

window.customElements.define('k-control-mode-switch', CKControlModeSwitch);
class CKControlSpeed extends CKControl {
  getType() {
    return 'top';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    let self = this;
    this.style.position = 'absolute';
    this.style.width = '50px';
    this.style.height = '100%';
    this.style.left = '0';
    this.style.top = '50%';
    this.style.maxHeight = '200px';

    this.shadow.innerHTML += '<div class="body disabled"><div class="value">1x</div><input class="slider" orient="vertical" type="range" min="-16" max="16" step="1" value="1"><div class="info">SPEED</div></div>';
    this.slider = this.shadow.querySelector('.slider');
    this.speedval = this.shadow.querySelector('.value');
    this.slider.addEventListener("input", function (event) {
      self.speedval.innerHTML = self.slider.value + 'x';
      self.player.playbackRate = parseInt(self.slider.value);
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    this.slider.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    setTimeout(function () {
      if (self.player.getAttribute('noreverse') !== null)
        self.slider.setAttribute('min', 0);
    }, 0);

    setTimeout(function () {
      self.player.player.addEventListener("statusupdate", function (event) {
        clearTimeout(self.enable_timeout);
        if (event.status === 'invalidtoken')
          self.shadow.querySelector('.body').classList.add('disabled');
        else if (event.status !== 'loading')
          self.enable_timeout = setTimeout(function () {
            self.shadow.querySelector('.body').classList.remove('disabled');
          }, 300);
      }, {once: false});
    }, 0);
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  css() {
    return super.css() + `
      .body.disabled { display:none; }
      .body {
        width: 100%;
        height: 100%;
        position: absolute;
        top: -50%;
        background:#0004;
        padding:10px 0;
      }
      .value { height:20px;color:white;text-align:center; }
      input[type="range"] {
        -webkit-appearance: slider-vertical;
        width: 50px;
        height: calc(100% - 40px);
        margin: 0;
      }
      .info {
        color:white;
        font-size:55%;
        text-align:center;
      }
    `;
  }
}

window.customElements.define('k-control-speed', CKControlSpeed);
class CKControlTimeinfo extends CKControl {
  getType() {
    return 'double';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    let self = this;
    this.shadow.innerHTML += '<div class="timearea">2021-06-23<br>18:58:15</div>';
    this.timearea = this.shadow.querySelector('.timearea');

    setTimeout(function () {
      self.player.addEventListener("timeupdate", function () {
        let utc = parseInt(self.player.getAttribute('utc'));
        utc = !isNaN(utc) ? utc : -(new Date()).getTimezoneOffset() / 60;
        let time = new Date(self.player.currentUtcTime);
        if (isNaN(time)) debugger;
        if (isNaN(time)) return;
        // if (time < 100000) debugger;
        time.setHours(time.getHours() + utc);
        self.timearea.innerHTML = (time).toISOString().substr(0, 19).replace('T', '<br>');
      }, {once: false});

      if (self.player.getAttribute('utc') === null)
        self.removeAttribute('utc');
      else
        self.setAttribute('utc', self.player.getAttribute('utc'));
    }, 0);
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  css() {
    return super.css() + `
      .timearea {
        height: calc(100% - 4px);
        width: 100%;
        white-space: nowrap;
        padding: 4px 0px 0 0px;
        line-height: 16px;
        text-align: center;
        color: white;
        font-size: 14px;
      }
    `;
  }
}

window.customElements.define('k-control-timeinfo', CKControlTimeinfo);
class CKControlTimepicker extends CKControl {
  getType() {
    return 'full';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  setRedux(redux) {
    let self = this;
    super.setRedux(redux);
    // redux.subscribe('min_time', function (event) {
    //   if (!isNaN(parseInt(event.event_param.value)))
    //     self.picker.setAttribute('mintime', parseInt(event.event_param.value));
    //   else
    //     self.picker.removeAttribute('mintime');
    // });
    redux.subscribe('time_line_update', function (event) {
      self.range = {times: event.detail.event_param.times, durations: event.detail.event_param.durations};
      self.picker.update(true);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    let self = this;
    setTimeout(function () {
      let multiplayerController = document.querySelector('k-multiplayer-controller');
      if (multiplayerController) {
        self.picker = multiplayerController.shadow.querySelector(' k-timeline-picker');
      } else {
        let tls = self.player.getAttribute('timelineselector');
        let el = tls ? document.querySelector(tls) : null;
        if (el) {
          if (!el.querySelector('k-timeline-picker')) {
            el.innerHTML = '<k-timeline-picker databar frames="25" scale="600" maxscale="2660" minscale="12" maxtime="+600000"></k-timeline-picker>';
            self.timelinePickerOwner = true;
          }
          self.picker = el.querySelector('k-timeline-picker');
        } else {
          self.shadow.innerHTML += '<k-timeline-picker databar frames="25" scale="600" maxscale="2660" minscale="12" maxtime="+600000"></k-timeline-picker>';
          self.picker = self.shadow.querySelector('k-timeline-picker');
          self.timelinePickerOwner = true;
        }
      }

      if (self.player.getAttribute('utc') === null)
        self.picker.removeAttribute('utc');
      else
        self.picker.setAttribute('utc', self.player.getAttribute('utc'));

      if (self.player.player.options.maxscale) self.picker.setAttribute('maxscale', self.player.player.options.maxscale);
      if (self.player.player.options.minscale) self.picker.setAttribute('minscale', self.player.player.options.minscale);

      self.picker.addEventListener("getrange", function (e) {
        if (!self.player || !self.player.shadow?.innerHTML) {
          return;
        }
        const token = self.player.getAttribute('src');
        if (!token) {
          return;
        }

        self.range = self.player.player.rangeRequest(e.detail.time_from, e.detail.time_to, e.detail.from_out ? 5000 : 0);
        self.events = self.player.player.events;
        if (self.range) {
          e.detail.ranges[self.player.id] = {...self.range};
        }
        if (self.events) {
          e.detail.events[self.player.id] = self.events;
        }
        // e.detail.ranges = self.range !== undefined ? self.range : {times:[],durations:[]};
      });

      if (!self.timelinePickerOwner) {
        return;
      }

      self.picker.addEventListener("moving", function () {
        self.early_playing = self.player.isPlaying();
        self.player.pause().catch(function () {
        });
      }, {once: false});
      // self.picker.addEventListener("moved", function(e){
      //   if (self.early_playing)
      //   self.player.play().catch(function() {});
      // },{once:false});

      self.player.addEventListener("timeupdate", function (e) {
        if (self.skip_next_timeupdate) {
          delete self.skip_next_timeupdate;
          return;
        }
        if (!e.detail.currentUtcTime) return;
        if (e.detail.currentUtcTime < new Date('Jan 1 2000 0:00:00').getTime()){
          debugger;
          return;
        }
        self.picker.setAttribute('centerutctime', e.detail.currentUtcTime);
      }, {once: false});

      self.picker.addEventListener("change", function (e) {
        clearTimeout(self.change_time_timer);
        self.change_time_timer = setTimeout(function () {
          let time = parseInt(self.picker.getAttribute('centerutctime'));
          self.player.pause();
          self.player.currentUtcTime = time;
          self.skip_next_timeupdate = true;
          self.player.sendTimeUpdate();

          let step = parseInt(self.picker.getAttribute('step'));
          if (!isNaN(step))
            self.player.player.storage.posters_cache.autoPreload(time, step);
        }, 10);
      }, {once: false});

      // self.player.player.addEventListener("rangeupdate", function (e) {
      //   self.range = {times: e.times, durations: e.durations};
      //   self.picker.update(true);
      // }, {once:false});
      // self.picker.ongetranges = function (from, to, interval) {
      //   self.player.player.rangeRequest(from, to);
      //   return self.range !== undefined ? self.range : {times: [], durations: []};
      // };
    }, 0);
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  hasVideoData() {
    if (!this.range) {
      return true;
    }
    const currentTime = this.player.currentUtcTime;
    let index = this.range.times.findIndex((time) => time > currentTime);
    if (index <= 0) {
      return false;
    }
    return this.range.durations[index - 1] > 0;
  }

  hasNextVideoData() {
    if (!this.range) {
      return false;
    }
    const currentTime = this.player.currentUtcTime;
    return this.range.times.some((time, i) => time >= currentTime && this.range.durations[i] > 0);
  }

  css() {
    return super.css() + `
      k-timeline-picker {
        height: 100%;
        width: 100%;
        display: block;
        color: white;
        background: #00000080;
      }
    `;
  }
}

window.customElements.define('k-control-timepicker', CKControlTimepicker);
class CKControlVolume extends CKControl {
  getType() {
    return 'top';
  }

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    let self = this;
    this.style.position = 'absolute';
    this.style.width = '50px';
    this.style.height = '100%';
    this.style.right = '0';
    this.style.top = '50%';
    this.style.maxHeight = '200px';

    this.shadow.innerHTML += '<div class="body disabled"><div class="value">0.0</div><input class="slider" orient="vertical" type="range" min="0" max="1" step=".1" value="0"><div class="info">VOLUME</div></div>';
    this.slider = this.shadow.querySelector('.slider');
    this.volume = this.shadow.querySelector('.value');

    this.slider.addEventListener("input", function (event) {
      self.volume.innerHTML = parseFloat(self.slider.value).toFixed(1);
      self.player.volume = parseFloat(self.slider.value).toFixed(1);
      event.preventDefault();
      event.stopPropagation();
      return false;
    });
    this.slider.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    setTimeout(function () {
      self.slider.value = self.player.volume.toFixed(1);
      self.volume.innerHTML = parseFloat(self.slider.value).toFixed(1);
    }, 0);

    setTimeout(function () {
      self.player.player.addEventListener("statusupdate", function (event) {
        clearTimeout(self.enable_timeout);
        if (event.status === 'invalidtoken')
          self.shadow.querySelector('.body').classList.add('disabled');
        else if (event.status !== 'loading')
          self.enable_timeout = setTimeout(function () {
            self.shadow.querySelector('.body').classList.remove('disabled');
          }, 300);
      }, {once: false});
    }, 0);
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }

  css() {
    return super.css() + `
      .body.disabled { display:none; }
      .body {
        width: 100%;
        height: 100%;
        position: absolute;
        top: -50%;
        background:#0004;
        padding:10px 0;
      }
      .value { height:20px;color:white;text-align:center; }
      input[type="range"] {
        -webkit-appearance: slider-vertical;
        width: 50px;
        height: calc(100% - 40px);
        margin: 0;
      }
      .info {
        color:white;
        font-size:55%;
        text-align:center;
      }
    `;
  }
}

window.customElements.define('k-control-volume', CKControlVolume);
class CKVideo extends HTMLElement{
  static get observedAttributes() {
    return ['src'];
  }
  get POSTER_PLAY_DURATION(){return this.poster_play_duration!==undefined?this.poster_play_duration*1000:2000};
  constructor() {
    super();
  }
  setStatus(status, delay=false){
    clearTimeout(this.status_timer);
    let self = this;
    if (!delay){
      this.setAttribute('status',status);
      let kv_event_statusupdate = new Event('statusupdate',{cancelable: false, bubbles: true});
      kv_event_statusupdate.status = status;
      this.dispatchEvent(kv_event_statusupdate);
      return;
    }
    this.status_timer = setTimeout(function(){
      self.status_timer = undefined;
      self.setAttribute('status',status);
      let kv_event_statusupdate = new Event('statusupdate',{cancelable: false, bubbles: true});
      kv_event_statusupdate.status = status;
      self.dispatchEvent(kv_event_statusupdate);
    },50);
  }
  get currentUtcTime(){
    let t = parseInt(this.getAttribute('time') || 0);
    let off = parseInt(this.getAttribute('off')) || 0;
    if (this.getAttribute('time')!==null && this.nativeEl.src)
      return t + parseInt(this.nativeEl.currentTime*1000)-off;
    if (this.getAttribute('playtime')!==null){
      let pt = parseInt(this.getAttribute('playtime') || 0);
      if (pt<t) pt=t;
      return pt;
    }
    return t+parseInt(this.nativeEl.currentTime*1000)-off;
  }
  set currentUtcTime(time){
    this.setTimePromise(time).catch(function(){});
  }
  set playbackRate(rate){
    this.nativeEl.playbackRate = rate > 0 ? rate : 0;
  }
  get playbackRate(){
    return this.nativeEl.playbackRate;
  }
  set src(src){
    clearTimeout(this.imagetimer);
    this.removeAttribute('readytoshow');
    let self = this;
    let t = src.indexOf(';');let msec;let time;
    if (t<30 && parseInt(src.substr(0,t))!=src.substr(0,t)){
      let v = src.substr(0,t);
      let d = new Date(v);
      if (!isNaN(d)){
        time = d.getTime();
        src = src.substr(t+1);
      }
    }
    t = src.indexOf(';');
    if (t<10){
      let v = src.substr(0,t);
      if (!isNaN(parseInt(v))){
        msec = parseInt(v);
        src = src.substr(t+1);
      }
    }

    this.setSourcePromise(src,time,msec).catch(function(){}).finally(function(){
      if (time || msec){
        if (time) self.setAttribute('playtime',time);
        self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:time}}));
      }

    });
  }
  get src(){
    return this.original_src;
  }
  play(abort_controller)          {
    this.setAttribute('autoplay','');
    return this.playPromise(abort_controller);
  }
  pause(abort_controller)         {this.removeAttribute('autoplay');return this.pausePromise(abort_controller);}
  superSrc(src)   {
  	const p=this.nativeEl.playbackRate;this.nativeEl.src = src;this.nativeEl.playbackRate=p;
  	}
  isEmpty()       {return !this.original_src&&!this.poster || !this.getAttribute('time') || !this.getAttribute('msec');}
  isError()       {return this.getAttribute('error')!==null;}
  getFirstTime()  {return this.getAttribute('time')!==null ? parseInt(this.getAttribute('time') || 0) : undefined;}
  getLastTime()   {return this.getAttribute('msec')!==null ? ((parseInt(this.getAttribute('time') || 0)) + (parseInt((this.getAttribute('duration')||0)*1000) || parseInt(this.getAttribute('msec') || 0)) - 1) : undefined;}
  getInitialLastTime()   {return this.getAttribute('msec')!==null ? ((parseInt(this.getAttribute('time') || 0)) + (parseInt(this.getAttribute('msec') || 0))) : undefined;}
  isPlaying()     {return !this.nativeEl.paused && this.nativeEl.readyState > 2;}
  isPlayRequired(){return this.getAttribute('autoplay')!==null;}
  isWaiting()     {return this.getAttribute('status')=='waiting';}
  isReadyForPlay(){return this.nativeEl.src && this.getAttribute('loaded')==100;}
  isFull()        {return this.getAttribute('fullload')!==null;}
  isFilled()      {return this.nativeEl.src && (parseInt(this.getAttribute('msec'))>0 || parseInt(this.getAttribute('duration'))>0);}
  isLoaded()      {return !this.load_promise;}
  isSeeking()     {return this.nativeEl.seeking;}
  atStart()       {return this.nativeEl.currentTime==0;}
  atEnd()         {return this.nativeEl.currentTime==this.nativeEl.duration;}
  isReadyToShow() {return !this.isError() && this.getAttribute('readytoshow')!==null;}

  getRanges(from, to, interval){
    return [this.getFirstTime() || 0,this.getInitialLastTime()||this.getLastTime()||parseInt(this.nativeEl.duration*1000+(this.getFirstTime()||0))||0];
  }
  isOutOfBound(){
    let currentUtcTime = this.currentUtcTime;
    return currentUtcTime<this.getFirstTime() || currentUtcTime>this.getLastTime();
  }
  abort(abort_controller){
    if (this.abort_controller) this.abort_controller.abort();
    this.abort_controller = abort_controller ? abort_controller : new AbortController();
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.do_not_attr_callback) return;
    if (name=="src"){
      let utc_from_in_msec = this.getAttribute('time')===null ? undefined : parseInt(this.getAttribute('time'));
      let duration_msec = this.getAttribute('msec')===null ? undefined : parseInt(this.getAttribute('msec'));
      let off = this.getAttribute('msec')===null ? undefined : parseInt(this.getAttribute('off'));
      this.setSourcePromise(newValue, utc_from_in_msec, duration_msec, this.getAttribute('fullload')!==null, off).catch(function(e){});
    }
  }
  connectedCallback() {
    this.shadow = this.attachShadow({mode: 'open'});
    this.shadow.innerHTML = '<video playsinline="true" crossorigin="anonymous" preload norepeat style="width:100%;height:100%;"></video>';
    this.nativeEl = this.shadow.querySelector('video');
    // this.nativeImg = this.shadow.querySelector('.img1');
    // this.nativeImg2 = this.shadow.querySelector('.img2');

    if (this.hasAttribute('muted')) {
      this.nativeEl.setAttribute('muted', '');
    }

    let self = this;
    this.players_layer = this;
    this.nativeEl.addEventListener("timeupdate", function(e) {
      let time = self.currentUtcTime;
      if (isNaN(time) || self.isEmpty() || self.isError()) {
        self.removeAttribute('playtime');
        self.setStatus('pause');
      } else
      if (self.isPlaying())
        self.setAttribute('playtime', time);
      if (!this.paused && !self.skip_next_timeupdate)
        self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.currentUtcTime}}));
    },false);
    this.nativeEl.addEventListener("error", function(e) {
      self.setStatus('error');
      self.removeAttribute('readytoshow');
      self.removeAttribute('playtime');
      self.removeAttribute('duration');self.removeAttribute('loaded');self.removeAttribute('fullload');
      if (self.nativeEl.src!==''){
        let err='MEDIA_ERR_UNDEFINED';
        if (e&&e.target&&e.target.error&&e.target.error.code){
          switch(e.target.error.code){
            case e.target.error.MEDIA_ERR_ABORTED: err='MEDIA_ERR_ABORTED'; break;
            case e.target.error.MEDIA_ERR_NETWORK: err='MEDIA_ERR_NETWORK'; break;
            case e.target.error.MEDIA_ERR_DECODE: err='MEDIA_ERR_DECODE'; break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED: err='MEDIA_ERR_SRC_NOT_SUPPORTED'; break;
          }
          self.setAttribute('error',err);
        } else {
          self.nativeEl.removeAttribute('poster');
        }
      }
      if (self.pause_promise) self.pause_promise_reject();
      if (self.play_promise) self.play_promise_reject(self.abort_controller);
      if (self.load_promise) self.load_promise_reject(self.abort_controller);
      if (self.seek_promise) self.seek_promise_reject(self.abort_controller);
//            self.kv_event_error.target = e&e.target ? e.target : undefined;
//            self.dispatchEvent(self.kv_event_error);
      self.dispatchEvent(new CustomEvent("error", {detail: { src: e.srcElement?e.srcElement:this} }))
    },false);
    this.nativeEl.addEventListener("durationchange", function(r) {
      if (!isFinite(this.duration)) return;
      self.setAttribute('duration',this.duration || 0);
      self.dispatchEvent(new Event('durationchange',{cancelable: false, bubbles: true}));
    });
    this.nativeEl.addEventListener("loadedmetadata", function(r) {
      let kv_event_loadedmetadata = new Event('loadedmetadata',{cancelable: false, bubbles: true});
      kv_event_loadedmetadata.target2 = r.target;
      kv_event_loadedmetadata.detail = r.detail;
      self.dispatchEvent(kv_event_loadedmetadata);
    });
    this.nativeEl.addEventListener("canplay", function(r) {
      if (self.isPlaying()) self.setStatus('playing'); else self.setStatus('pause');
      if (self.src){
        clearTimeout(self.imagetimer);
        self.setAttribute('readytoshow','')
        self.dispatchEvent(new Event('readytoshow',{cancelable: false, bubbles: true}));
      };
      if (self.getAttribute('loaded')===null) self.setAttribute('loaded',0);
      if (self.load_promise) self.load_promise_resolve(self.abort_controller);
//            self.setStatus(self.isPlayRequired() ? 'playing' : 'pause');
      self.dispatchEvent(new Event('canplay',{cancelable: false, bubbles: true}));
    });
    this.nativeEl.addEventListener("canplaythrough", function(r) {
      if (self.isPlaying()) self.setStatus('playing'); else self.setStatus('pause');
      self.setAttribute('readytoshow','')
      self.setAttribute('loaded',100);
//            self.dispatchEvent(new Event('readytoshow',{cancelable: false, bubbles: true}));
//            self.setStatus(self.isPlayRequired() ? 'playing' : 'pause');
      self.dispatchEvent(new Event('canplaythrough',{cancelable: false, bubbles: true}));
    });
    this.nativeEl.addEventListener("ended", function() {
//            self.playRequired = false;
      self.setStatus('pause');
      if (self.play_promise) self.play_promise_reject(self.abort_controller);
      if (self.pause_promise) self.pause_promise_resolve();
      self.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("waiting", function() {
      self.setStatus('loading',true);
      self.dispatchEvent(new Event('waiting',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("playing", function() {
      self.setStatus('playing');
      if (self.play_promise) self.play_promise_resolve(self.abort_controller);
      if (self.pause_promise) self.pause_promise_reject();
      self.dispatchEvent(new Event('playing',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("pause", function() {
      self.setStatus('pause');
      if (self.play_promise) self.play_promise_reject(self.abort_controller);
      if (self.pause_promise) self.pause_promise_resolve();
      self.dispatchEvent(new Event('pause',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("loadstart", function() {
      self.setStatus('loading');
      self.removeAttribute('duration');self.setAttribute('loaded',0);
      self.dispatchEvent(new Event('loadstart',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("seeking", function() {
      self.setStatus('seeking',true);
      self.dispatchEvent(new Event('seeking',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("seeked", function() {
      if (self.isPlayRequired()) self.setStatus('playing'); else self.setStatus('pause');
      if (self.seek_promise) self.seek_promise_resolve(self.abort_controller);
      self.dispatchEvent(new Event('seekend',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("emptied", function() {
      self.setStatus('pause');
      self.removeAttribute('readytoshow');
      self.removeAttribute('playtime');
      self.removeAttribute('duration');self.removeAttribute('loaded');
      if (self.load_promise) self.load_promise_resolve();
      if (self.play_promise) self.play_promise_reject(self.abort_controller);
      if (self.pause_promise) self.pause_promise_resolve();
      if (self.seek_promise) self.seek_promise_reject(self.abort_controller);
      self.dispatchEvent(new Event('emptied',{cancelable: false, bubbles: true}));
    },false);
    this.nativeEl.addEventListener("progress", function(r) {
      let percent = null;
      if (r.srcElement.buffered.length > 0 && r.srcElement.buffered.end && r.srcElement.duration) {
        percent = r.srcElement.buffered.end(0) / r.srcElement.duration;
      } else if (r.srcElement.bytesTotal != undefined && r.srcElement.bytesTotal > 0 && r.srcElement.bufferedBytes != undefined) {
        percent = r.srcElement.bufferedBytes / r.srcElement.bytesTotal;
      }
      self.setAttribute('duration',r.srcElement.duration || 0);
      if (percent !== null) {
        percent = 100 * Math.min(1, Math.max(0, percent));
        if (self.getAttribute('loaded')!==null && parseInt(self.getAttribute('loaded'))<percent)
          self.setAttribute('loaded',parseInt(percent));
      }
      self.dispatchEvent(new Event('progress',{cancelable: false, bubbles: true}));
    },false);
  }

  loadPromise(){
    if (this.load_promise) return this.load_promise;
    return new Promise(function(resolve, reject){resolve();});
  }
  clearAllFlags(){
    this.removeAttribute('playtime');
    this.removeAttribute('duration');
    this.removeAttribute('loaded');
    this.removeAttribute('error');
    this.removeAttribute('fullload');
    this.removeAttribute('readytoshow');
    clearTimeout(this.imagetimer);
    clearTimeout(this.poster_play_timer);
    clearTimeout(this.poster_time_timer);

//        this.poster = '';
//        this.removeAttribute('status');
  }

  setSourcePromise(src, utc_from_in_msec, duration_msec, full_load, off){
    let self = this;
    if (src || (!isNaN(utc_from_in_msec)) && (!isNaN(duration_msec))) {
      if (this.original_src == src){
        if (!isNaN(utc_from_in_msec)) this.setAttribute('time',parseInt(utc_from_in_msec));else this.removeAttribute('time');
        if (!isNaN(duration_msec)) this.setAttribute('msec',parseInt(duration_msec));else this.removeAttribute('msec');
        if (!isNaN(off)) this.setAttribute('off',parseInt(off));else this.removeAttribute('off');
        if (this.load_promise) return this.load_promise;
        return new Promise(function(resolve, reject){resolve(self.abort_controller);});
      }
      this.original_src = src;
    } else {
      this.clearAllFlags();
      this.removeAttribute('time');
      this.removeAttribute('msec');
      this.removeAttribute('off');
      this.removeAttribute('status');
      if (!this.original_src) {
        if (this.load_promise) return this.load_promise;
        return new Promise(function(resolve, reject){resolve(self.abort_controller);});
      }
      this.original_src = undefined;
      self.removeAttribute('src');
      self.nativeEl.poster='';
      self.nativeEl.removeAttribute('src');
      self.nativeEl.removeAttribute('poster');
//            try{self.load();}catch(e){};
      return new Promise(function(resolve, reject){resolve(self.abort_controller);});
    }
    this.abort();

    this.clearAllFlags();

    if (!isNaN(utc_from_in_msec)) this.setAttribute('time',parseInt(utc_from_in_msec));else this.removeAttribute('time');
    if (!isNaN(duration_msec)) this.setAttribute('msec',parseInt(duration_msec));else this.removeAttribute('msec');
    if (!isNaN(off)) this.setAttribute('off',parseInt(off));else this.removeAttribute('off');

    if (self.pause_promise) self.pause_promise_reject(); self.pause_promise = undefined;
    if (self.play_promise) self.play_promise_reject(self.abort_controller); self.play_promise = undefined;
    if (self.seek_promise) self.seek_promise_reject(self.abort_controller); self.seek_promise = undefined;
    if (self.load_promise) self.load_promise_reject(self.abort_controller); self.load_promise = undefined;

    if (src.substr(0,1)==='#')
      return Promise.resolve();

    this.setStatus('loading',true);
    function tryLoad(src){
      if (self.abort_controller) self.abort_controller.signal.addEventListener('abort', function(){
        if (self.load_promise) self.load_promise_reject(self.abort_controller);
        self.load_promise=undefined;
      });
      self.load_promise = new Promise(function(resolve, reject){
        self.load_promise_resolve = resolve;
        self.load_promise_reject = reject;
      }).then(function(){
        self.load_promise=undefined;
        if (self.isPlayRequired()) self.setStatus('playing'); else self.setStatus('pause');
        let off = parseInt(self.getAttribute('off'));
        if (!isNaN(off))
          self.nativeEl.currentTime = off/1000;
        /*
                        let off = parseInt(this.getAttribute('off')||0);
                        if (off) return self.setTimePromise(time).then(function(){
                            return self.abort_controller;
                        });
        */
        return self.abort_controller;
      },function(err){
        self.load_promise=undefined;
//                if (self.isPlayRequired()) self.setStatus('playing'); else self.setStatus('pause');
        if (!(err instanceof AbortController)) self.setStatus('error');
        throw err;
      });
      self.do_not_attr_callback=true;
      const p=self.nativeEl.playbackRate;
      if (!src){
        self.removeAttribute('src');
        self.nativeEl.removeAttribute('src');
//                self.superSrc(src);
      }
      else{
        self.setAttribute('src',src);
        self.superSrc(src);
      }
      delete self.do_not_attr_callback;
      self.load();
      if (src=='') setTimeout(function(){
        self.load_promise_resolve(self.abort_controller);
      },0);
      self.nativeEl.playbackRate=p;
      return self.load_promise;
    }
    if (full_load!==undefined && !full_load || full_load===undefined && self.getAttribute('fulload')===null) return tryLoad(src);
    self.setAttribute('loaded',0);
    self.dispatchEvent(new Event('waiting',{cancelable: false, bubbles: true}));

    return fetch(src,{signal:self.abort_controller.signal,  headers: { range: 'bytes=0-100000000' } }).then(function(res){
      if (parseInt(res.status/100)!==2)
        return tryLoad(src);
      return res.blob().then(function(blob){
        self.setAttribute('fullload','');
        return tryLoad(window.URL.createObjectURL(blob));
      });
    },function(err){
      if (err.code!==undefined && err.code == err.ABORT_ERR){
        if (self.isPlayRequired()) self.setStatus('playing'); else self.setStatus('pause');
        throw err;
      }
//            console.warn('Full load failed. May be CORS?')
      return tryLoad(src);
    });
  }
  load(){
    this.nativeEl.load();
  }
  toStart(){
    let time = parseInt(this.getAttribute('time')||0);
    let off = parseInt(this.getAttribute('off')||0);
    return this.setTimePromise(time+off);
  }
  toEnd(abort_controller){
    if (abort_controller && this.abort_controller!=abort_controller) {
      this.abort_controller.abort();
      this.abort_controller = abort_controller;
    }
    let time = parseInt(this.getAttribute('time')||0) + parseInt(this.getAttribute('msec')||0);
    return this.setTimePromise(time, abort_controller);
  }
  setTimePromise(utc_milliseconds, abort_controller){
    if (!this.isPlaying())
      this.setAttribute('playtime', utc_milliseconds);
    if (abort_controller && this.abort_controller!=abort_controller) {
      this.abort_controller.abort();
      this.abort_controller = abort_controller;
    }
    if (!this.nativeEl.src) return Promise.resolve();

    let self = this;
    let time = parseInt(self.getAttribute('time')) || 0;
    let off = parseInt(this.getAttribute('off')) || 0;
    let currentTime = parseFloat(utc_milliseconds - time)/1000 + off/1000;
    if (this.seek_promise) {
      if (currentTime<=this.nativeEl.duration)
        this.setSuperCurrentTime(currentTime);
      return this.seek_promise;
    }
    if (this.isEmpty() || this.isError())
      return new Promise(function(resolve, reject){resolve();});
    if (this.nativeEl.currentTime!=currentTime){
      self.seek_promise = new Promise(function(resolve, reject){
        self.seek_promise_resolve = resolve;
        self.seek_promise_reject = reject;
      }).then(function(){
        if (self.isPlayRequired()) self.setStatus('playing'); else {
          if (utc_milliseconds>self.getLastTime() || utc_milliseconds<self.getFirstTime())
            self.setStatus('nodata');
          else
            self.setStatus('pause');
        }
        self.seek_promise=undefined;
        return abort_controller;
      },function(err){
//console.log('Seek fail');
        if (self.isPlayRequired()) self.setStatus('playing'); else self.setStatus('pause');
        self.seek_promise=undefined;
//                throw err;
      });
//            self.setStatus('loading');
//            if (currentTime<=self.duration)
      self.setSuperCurrentTime(currentTime);
      if (this.abort_controller) this.abort_controller.signal.addEventListener('abort', function(){
        if (self.seek_promise) self.seek_promise_reject(self.abort_controller);
        self.seek_promise=undefined;
      });
      return self.seek_promise;
    }
    return new Promise(function(resolve, reject){resolve(abort_controller);});
  }
  setPlaybackRatePromise(speed){
    this.nativeEl.playbackRate = speed;
    return new Promise(function(resolve, reject){resolve();});
  }
  disconnectedCallback(){
    if (this.play_promise)  this.play_promise_reject();
    if (this.seek_promise)  this.seek_promise_reject();
    if (this.pause_promise) this.pause_promise_reject();
    if (this.load_promise)  this.load_promise_reject();
  }

  setSuperCurrentTime(time){
    if (isNaN(time))
      debugger;
    this.nativeEl.currentTime = time;
  }
  preparePlay(abort_controller){
    if (abort_controller && this.abort_controller!=abort_controller) {
      this.abort_controller.abort();
      this.abort_controller = abort_controller;
    }
    let self = this;
    if (this.pause_promise)
      this.pause_promise_reject();
    if (this.isEmpty()) setTimeout(function(){self.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));},0);
    if (this.isError()) setTimeout(function(){if (self.isError()) self.dispatchEvent(new Event('error',{cancelable: false, bubbles: true}));},0);
    if (this.isEmpty() || this.isError())
      return new Promise(function(resolve, reject){reject();});
    if (this.isPlaying())
      return new Promise(function(resolve, reject){resolve();});
    if (this.play_promise)
      return this.play_promise;
  }
  playPromise(abort_controller){
    clearTimeout(this.poster_play_timer);
    clearTimeout(this.poster_time_timer);
    this.setAttribute('autoplay','')
    let self = this;
    let p = this.preparePlay(abort_controller);
    if (p) return p;
    if (this.atEnd() || this.original_src.substr(0,1)==='#'){
      setTimeout(function(){self.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));},0);
      if (this.getAttribute('norepeat')!==null)
        return new Promise(function(resolve, reject){resolve(abort_controller);});
    }

    if (!this.nativeEl.src) return this.posterPlay();

    this.play_promise = new Promise(function(resolve, reject){
      self.play_promise_resolve = resolve;
      self.play_promise_reject = reject;
    }).then(function(abort_controller){
      self.setStatus('playing');
      self.play_promise=undefined;
      return abort_controller;
    },function(err){
      self.play_promise=undefined;
//            if (err instanceof AbortController) return err;
      throw err;
    });
    this.nativeEl.play();
    if (abort_controller) abort_controller.signal.addEventListener('abort', function(){
      if (self.play_promise) self.play_promise_reject(self.abort_controller);
      self.play_promise=undefined;
    });
    return this.play_promise;
  }
  posterPlay(){
    let self=this;
    clearTimeout(this.poster_play_timer);
    clearTimeout(this.poster_time_timer);
    let delay = this.getInitialLastTime() - this.currentUtcTime;
    if (this.POSTER_PLAY_DURATION>0 && delay>this.POSTER_PLAY_DURATION) delay=this.POSTER_PLAY_DURATION;
    this.poster_play_timer = setTimeout(function(){
      self.setAttribute('playtime', self.getInitialLastTime());
      setTimeout(function(){
        clearTimeout(self.poster_time_timer);
        self.currentUtcTime = self.getInitialLastTime();
        self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.currentUtcTime}}));
        self.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));
      },0);
    }, delay);
    function send_timeupdate(){
      let nt = self.currentUtcTime+1000;
      if (nt>=self.getInitialLastTime()) return;
      self.currentUtcTime = nt;
      self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.currentUtcTime}}));
      setTimeout(send_timeupdate,1000);
    }
    this.poster_time_timer = setTimeout(send_timeupdate,1000);

    return Promise.resolve();
  }
  superPause(){
    this.nativeEl.pause();
  }
  get volume(){
    return this.nativeEl.volume;
  }
  set volume(v){
    this.nativeEl.volume = v;
  }
  get poster(){
    return this.nativeEl.poster;
  }
  set poster(v){
    this.setPoster(v);
  }
  isPosterLoaded(url){
    return this.nativeImg.style.opacity=='0' && (this.nativeImg.src==url || this.nativeImg2.src==url || this.nativeEl.poster==url);
  }
  setPoster(normal_poster, fast_poster){
    return;
    let self = this;
    clearTimeout(this.imagetimer);
    if (!normal_poster) {
      this.nativeImg.style.opacity='0';
      this.nativeImg.removeAttribute('src');
      this.nativeImg2.removeAttribute('src');
      this.nativeEl.removeAttribute('poster');
      return;
    }
    if (fast_poster){
//            if (this.nativeImg.src == fast_poster) return;
      this.nativeImg.style.opacity='0';
      this.nativeEl.onerror = function(e){
        clearTimeout(self.imagetimer);
        self.nativeImg.onload = null;
        self.nativeImg.removeAttribute('src');
        self.nativeEl.removeAttribute('poster');
      };
      this.nativeEl.poster = fast_poster;
      this.imagetimer = setTimeout(function(){
        self.nativeImg.style.opacity='0';
        if (!self.nativeEl.poster) return;
        self.nativeImg.onload = function () {
          self.nativeImg.style.opacity='0';
          if (self.nativeEl.poster){
            self.setAttribute('readytoshow','')
            self.dispatchEvent(new Event('readytoshow',{cancelable: false, bubbles: true}));
          }
          self.setPoster(normal_poster);
        };
        self.nativeImg.onerror = function () {
          self.nativeImg.style.opacity='0';
          self.nativeImg.removeAttribute('src');
          self.nativeEl.removeAttribute('poster');
          self.setPoster(normal_poster);
        }
        self.nativeImg.src = fast_poster;
      },0);
      return;
    }
    if (fast_poster==='')
      self.nativeImg.removeAttribute('src');
    else
    if (self.nativeImg.src)
      self.nativeImg.style.opacity='1';


//        if (self.nativeImg2.src == normal_poster) return;

    this.nativeEl.onerror = function(e){
      clearTimeout(self.imagetimer);
      self.nativeImg.style.opacity='0';
      self.nativeImg2.onload = null;
      self.nativeImg2.removeAttribute('src');
      self.nativeEl.removeAttribute('poster');
    };
    this.nativeEl.poster = normal_poster;
    if (!!this.nativeImg.src)
      this.nativeImg.style.opacity='1';

    this.imagetimer = setTimeout(function(){
      if (!self.nativeEl.poster) {
        self.nativeImg.style.opacity='0';
        return;
      }
      self.nativeImg2.onload = function () {
        self.nativeImg.style.opacity='0';
        if (!self.nativeEl.poster && self.nativeImg.src)
          self.nativeEl.poster = self.nativeImg.src;
        self.dispatchEvent(new Event('readytoshow',{cancelable: false, bubbles: true}));
        self.setAttribute('readytoshow','')
        let t=self.nativeImg;
        self.nativeImg=self.nativeImg2;
        self.nativeImg2=t;
      };
      self.nativeImg2.onerror = function () {
        self.nativeImg2.removeAttribute('src');
        self.nativeImg.style.opacity='0';
        self.nativeEl.removeAttribute('poster');
        self.nativeEl.load();
      }
      self.nativeImg2.src = normal_poster;
    },0);
  }
  pausePromise(abort_controller){
    clearTimeout(this.poster_play_timer);
    clearTimeout(this.poster_time_timer);
    this.removeAttribute('autoplay')
    if (abort_controller && this.abort_controller!=abort_controller)
      this.abort(abort_controller);
    let self = this;
    if (self.play_promise) self.play_promise_reject(self.abort_controller);
    if (this.pause_promise) return this.pause_promise;
    if (!this.isPlaying())
      return new Promise(function(resolve, reject){resolve();});
    self.pause_promise = new Promise(function(resolve, reject){
      self.pause_promise_resolve = resolve;
      self.pause_promise_reject = reject;
    }).then(function(abort_controller){
      self.setStatus('pause');
      self.pause_promise=undefined;
      delete self.skip_next_timeupdate;
      return abort_controller;
    },function(err){
      self.pause_promise=undefined;
      delete self.skip_next_timeupdate;
      throw err;
    });
    this.skip_next_timeupdate = true;
    this.nativeEl.pause();
    if (abort_controller) abort_controller.signal.addEventListener('abort', function(){
      if (self.pause_promise) self.pause_promise_reject(self.abort_controller);
      self.pause_promise=undefined;
    });
    return self.pause_promise;
  }
}

window.customElements.define('k-video', CKVideo);
class CKVideoReverse extends CKVideo{
    constructor() {
        super();
        this.speed=1;
    }

    get reverseFramerate(){
        const REVERSE_FRAME_RATE = 25; // 12 frame per second in reverse play
        let rf = this.getAttribute('reverse-frame-rate');
        rf = rf === null ? REVERSE_FRAME_RATE : parseInt(rf);
        if (rf<1) rf=1; if (rf>30) rf=30;
        return rf;
    }
    set playbackRate(rate){
        this.setPlaybackRatePromise(rate).catch(function(){});
    }
    get playbackRate(){
        return this.speed;
    }
    pause(abort_controller){
        this.removeAttribute('autoplay');
        return this.pauseWithReversePromise(abort_controller);
    }
    play(abort_controller){
        this.setAttribute('autoplay','');
        if (this.speed>=0)
            return super.play();
        let pr = this.preparePlay(abort_controller);
        if (pr) return pr;
        return this.playWithReversePromise(abort_controller);
    }
    isPlaying() {
        return this.play_reverse_timer || super.isPlaying();
    }
    setSourcePromise(src, utc_from_in_msec, duration_msec, full_load, off){
        if (this.play_reverse_timer) clearInterval(this.play_reverse_timer); this.play_reverse_timer = undefined;
        return super.setSourcePromise(src, utc_from_in_msec, duration_msec, full_load, off);
    }
    setPlaybackRatePromise(speed){
        let self = this;
        if (speed<0){
            let p = this.getAttribute('autoplay')!==null;
            self.speed = speed;
            self.setSuperPlaybackRate(-self.speed);
            let r = super.pause().then(function(abort_controller){
                if (self.getAttribute('autoplay')!==null && self.isPlayRequired() && !self.isPlaying() && !self.atStart())
                    return self.play(abort_controller);
                return new Promise(function(resolve, reject){resolve(abort_controller);});
            });
            if (p) this.setAttribute('autoplay','');
            return r;
        }
        if (this.speed<0 && this.isPlayRequired()){
            this.clearReverseTimer();
        }
        this.speed = speed;
        this.setSuperPlaybackRate(speed);
        return new Promise(function(resolve, reject){resolve();}).then(function(){
            if (!self.atEnd() && self.isPlayRequired() && !self.isPlaying()) return self.play();
        });
    }
    disconnectedCallback(){
        this.clearReverseTimer();
        super.disconnectedCallback();
    }

    clearReverseTimer(){
        if (this.play_reverse_timer) {
//console.log('Clear timer');
            clearTimeout(this.play_reverse_timer);
            this.play_reverse_timer = undefined;
        }
    }
    clearPlay(){
        if (this.pause_promise) this.pause_promise_resolve();
        if (this.play_promise) this.play_promise_reject(this.abort_controller);
        this.clearReverseTimer();
        this.setStatus('pause');
        this.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));
    }
    playReverseTimer(){
        if (this.speed>=0 || !this.isPlayRequired() || this.play_reverse_timer) 
            return;
        if (super.isPlaying()) 
            super.superPause();

        this.play_reverse_timer = undefined;
        this.setStatus('playing');
        let self = this;
        let time_correct = new Date().getTime();
        let t = self.currentUtcTime - 1/self.reverseFramerate*(-self.speed)*1000;
        if (t<this.getFirstTime() && self.currentUtcTime==this.getFirstTime()){
            this.clearPlay();
            return;
        }
        if (t<this.getFirstTime()) t=this.getFirstTime();
        if (t>this.getLastTime()) t=this.getLastTime();
//console.log('Timer fired');
        return this.setTimePromise(t).catch(function(err){
//console.log('Set time fail');
        }).finally(function(){
//console.log('Set time ok');
            let time = parseInt(self.getAttribute('time')||0);
            if (t>=time) {
                if (!self.play_reverse_timer && self.isPlayRequired()) {
                    let c = new Date().getTime() - time_correct;
                    c = c > 1000/self.reverseFramerate-10 ? 1000/self.reverseFramerate-10 : c;
//console.log('Set timer '+(1000/self.reverseFramerate - c));
                    self.play_reverse_timer = setTimeout(function(){
                        self.play_reverse_timer=undefined;
                        self.playReverseTimer();
                    },1000/self.reverseFramerate - c);
                }
                if (!self.play_reverse_timer){
                    self.setStatus('pause');
                }
                if (self.pause_promise) self.pause_promise_reject();
                if (self.play_promise) self.play_promise_resolve(self.abort_controller);
                return;
            }
            self.clearPlay();
        });
    }
    setSuperPlaybackRate(rate){
        super.playbackRate = rate;
    }
    pauseWithReversePromise(abort_controller){
        if (abort_controller && this.abort_controller!=abort_controller)
            this.abort(abort_controller);
        this.clearReverseTimer();
        if (this.play_promise) this.play_promise_reject(this.abort_controller);
        if (this.speed>=0){
            if (!super.isPlaying())
                return new Promise(function(resolve, reject){resolve();});
            let p = this.getAttribute('autoplay')!=null;
            let r = super.pause(abort_controller);
            if (p) this.setAttribute('autoplay','');
            return r;
        } else
            this.dispatchEvent(new Event('pause',{cancelable: false, bubbles: true}));
        this.setStatus('pause');
        return new Promise(function(resolve, reject){resolve();});
    }
    playWithReversePromise(abort_controller){
        let self = this;
        if (this.atStart()){
            setTimeout(function(){self.dispatchEvent(new Event('ended',{cancelable: false, bubbles: true}));},0);
            if (this.getAttribute('norepeat')!==null)
                return new Promise(function(resolve, reject){resolve(abort_controller);});
            return this.toEnd(abort_controller).then(function(abort_controller){
                if (self.atStart()) return abort_controller;
                return self.playWithReversePromise(abort_controller);
            });
        }

        if (abort_controller && this.abort_controller!=abort_controller)
            this.abort(abort_controller);
        this.play_promise = new Promise(function(resolve, reject){
            self.play_promise_resolve = resolve;
            self.play_promise_reject = reject;
        }).then(function(){
            if (self.pause_promise) self.pause_promise_reject();
            self.dispatchEvent(new Event('playing',{cancelable: false, bubbles: true}));
            self.play_promise=undefined;
        },function(err){
            if (self.play_promise) self.play_promise_reject(self.abort_controller);
            if (self.pause_promise) self.pause_promise_resolve();
            self.clearReverseTimer();
            if (self.play_promise) self.play_promise_reject(self.abort_controller);
            self.setStatus('pause');
            self.play_promise=undefined;
//            if (err instanceof AbortController) return err;
            throw err;
        });
        self.playReverseTimer();
        return this.play_promise;
    }
}

window.customElements.define('k-video-reverse', CKVideoReverse);
class CStorage{
  constructor(redux) {
    this.redux = redux;
    this.records_cache = new CTimeRange('');
    this.posters_cache = new CTimeRange('');
  }
  sendVideoLoaded(index){
    if (isNaN(index)) return;
    this.redux.post(this,'video_loaded',{data:{time:this.records_cache.range_times[index],msec:this.records_cache.range_durations[index],src:this.records_cache.range_data[index].s,off:this.records_cache.range_data[index].off},
      debug:''+(new Date(parseInt(this.records_cache.range_times[index])).toISOString().replace('T',' '))+' ['+this.records_cache.range_durations[index]+']'});
  }
  sendPosterLoaded(index){
    if (isNaN(index)) return;
    this.redux.post(this,'poster_loaded',{data:{time:this.posters_cache.range_times[index],msec:this.posters_cache.range_durations[index],src:this.posters_cache.range_data[index].s},
      debug:''+(new Date(parseInt(this.posters_cache.range_times[index])).toISOString().replace('T',' '))+' ['+this.posters_cache.range_durations[index]+']'});
  }
  sendPosterCached(index){
    if (isNaN(index)) return;
    this.redux.post(this,'poster_cached',{data:{time:this.posters_cache.range_times[index],msec:this.posters_cache.range_durations[index],src:this.posters_cache.range_data[index].s},
      debug:''+(new Date(parseInt(this.posters_cache.range_times[index])).toISOString().replace('T',' '))+' ['+this.posters_cache.range_durations[index]+']'});
  }
  getVideo(utctime){
    let i = this.records_cache.getRangeWithTimeIndex(utctime);
    if (i!==undefined) return {time:parseInt(this.records_cache.range_times[i]),
      msec:Math.sign(this.records_cache.range_durations[i])*parseInt(Math.abs(this.records_cache.range_durations[i])+this.records_cache.range_times[i]-parseInt(this.records_cache.range_times[i])),
      src:this.records_cache.range_data[i].s,off:this.records_cache.range_data[i].o};

    if (utctime<Date.now()-5000) this.tryGetVideo(utctime);

    i = this.records_cache.getSpaceWithTime(utctime);
    if (i!==undefined) return {time:parseInt(i.time),
      msec:Math.sign(i.msec)*parseInt(Math.abs(i.msec)+i.time-parseInt(i.time)),
      src:'',off:0};
  }
  getPoster(utctime){
    let i = this.posters_cache.getRangeWithTimeIndex(utctime);
    if (i!==undefined) return {time:this.posters_cache.range_times[i],msec:this.posters_cache.range_durations[i],src:this.posters_cache.range_data[i].s};
    this.tryGetPoster(utctime);
  }
  getNeighborPoster(utctime, reverse, cached){
    let i = cached ? this.posters_cache.getNearCachedIndex(utctime, reverse) : this.posters_cache.getNearWithDataIndex(utctime, reverse);
    if (i!==undefined) return {time:this.posters_cache.range_times[i],msec:this.posters_cache.range_durations[i],src:this.posters_cache.range_data[i].s};
  }
  invalidate(){
    this.records_cache.invalidate();
    this.posters_cache.invalidate();
  }
  tryGetVideo(utctime){
  }
  tryGetPoster(utctime){
  }
  setPossibleTimeRange(utctime_from, utctime_to){
  }
  setTimeStep(milliseconds){
  }
}

class CRedux{
  constructor(element) {
    let self=this;
    this.element = element;
    this.messages = [];
    this.events_list = [];
    this.element.addEventListener("kredux", function(event){
      if (self.element.getAttribute('debuginfo')===null || !self.checkEventForLog(event.detail.event_name)) return;
      let val='';
      if (event.detail.event_param && event.detail.event_param.value!==undefined) val=' = '+event.detail.event_param.value;
      if (event.detail.event_param && event.detail.event_param.debug)
        val+=' => '+event.detail.event_param.debug;
      else if (event.detail.event_param && !isNaN(event.detail.event_param.value) && event.detail.event_param.value>1600000000000)
        val += ' ['+(new Date(event.detail.event_param.value)).toISOString().replace('T',' ')+']';
      //console.groupCollapsed('['+(event.detail.event_object.tagName ? event.detail.event_object.tagName.toLowerCase() : event.detail.event_object.constructor.name)+']: '+event.detail.event_name+val);
      // if (event.detail.event_param) console.log(event.detail.event_param);
      // console.log(event.detail.event_object);
      //console.groupEnd();
    }, {once:false});
  }
  checkEventForLog(event_name){
    if (typeof this.check_event_for_log_callback !== 'function') return true;
    let el = this.check_event_for_log_callback();
    if (!el || !el.length) return false;
    if (el.indexOf(event_name)===-1) return false;
    return true;
  }
  setLoggingEventsListCallback(listcallback){
    this.check_event_for_log_callback = listcallback;
  }
  subscribe(event, func){
    this.element.addEventListener("kredux", function(e){
      if (event===e.detail.event_name)
        func(e);
    }, {once:false});
  }
  unsubscribe(func){
    this.element.removeEventListener("kredux", func, {once:false});
  }
  send(object, event_name, params){
    this.element.dispatchEvent(new CustomEvent('kredux',{cancelable: false, bubbles: true, detail:{event_name: event_name,event_object: object,event_param: params}}));
  }
  post(object, event, params){
    let self = this;
    let i=0;
    for (; i<this.messages.length;i++){
      if (this.messages['object']===object && this.messages['event']===event){
        this.messages['params'] = params;
        break;
      }
    }
    if (i>=this.messages.length)
      this.messages.push({object:object,event:event,params:params});
    if (this.timer) return;
    this.timer = setTimeout(function(){
      self.timer = undefined;
      while(self.messages.length>0){
        let e = self.messages.shift();
        self.send(e.object,e.event,e.params);
      }
    },0);
  }
}

class CKVideoSet extends HTMLElement{
  get LEFT_BUFFER_SIZE(){return this.options.left_prefetch || 1;};
  get RIGHT_BUFFER_SIZE(){return 1+(this.options.right_prefetch  || 2);};
  constructor() {
    super();
    this.options = this.getAttribute('options')===null ? {} : JSON.parse(this.getAttribute('options'));
    this.redux = new CRedux(this);
  }
  getRanges(from, to, interval){
    let ret = [];

    for(let srcelement of this.source_list_element.children) {
      let time = srcelement.getAttribute('time');
      let msec = srcelement.getAttribute('msec');
      if (time===null || msec===null) continue;
      time = parseInt(time);
      if (isNaN(time)) continue;
      msec = parseInt(msec);
      if (isNaN(msec)) continue;
      ret.push(time);
      ret.push(time+msec-1);
    }
    return ret;
  }
  sendTimeUpdate(){
    const player = this.shadow.querySelector('[pos="0"]');
    if (!player || player.isEmpty()) return;
    let time = player.currentUtcTime;
    if (isNaN(time)) return;
    this.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:time}}));
  }
  get currentUtcTime(){
    return parseInt(this.getAttribute('playtime')||0);
  }
  set currentUtcTime(time){
    if (this.currentUtcTime == time)
      return;
    this.setTimePromise(time).catch(function(){});
  }
  get playbackRate(){
    return this.speed;
  }
  set playbackRate(speed){
    this.setPlaybackRatePromise(speed).catch(function(){});
  }
  get volume(){
    return this.shadow.querySelector('[pos="0"]')?.volume;
  }
  set volume(v){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      const el = this.shadow.querySelector('[pos="'+i+'"]');
      if (el) {
        el.volume = v;
      }
    }
  }
  get muted(){
    return this.shadow.querySelector('[pos="0"]')?.muted;
  }
  set muted(v){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      const el = this.shadow.querySelector('[pos="'+i+'"]');
      if (el) {
        el.muted = v;
      }
    }
  }
  getVideo(){
    return this.shadow.querySelector('[pos="0"]').nativeEl;
  }
  isPlaying(){
    return this.getAttribute('autoplay')!==null;
  }
  get videoHeight(){
    return this.shadow.querySelector('[pos="0"]').videoHeight;
  }
  get videoWidth(){
    return this.shadow.querySelector('[pos="0"]').videoWidth;
  }
  play(){
    let self=this;
    this.setAttribute('autoplay','');
    clearTimeout(this.play_timer); if (this.play_reject) this.play_reject(); delete this.play_reject; delete this.play_promise;

    this.play_promise = new Promise(function(resolve, reject){
      self.play_timer = setTimeout(resolve, 0);
      self.play_reject = reject;
    }).then(function(){
      let pr = self.settime_promise ? self.settime_promise : Promise.resolve();
      return pr.then(function(){
        let player = self.shadow.querySelector('[pos="0"]');
        if (player.isPlaying()) return;
        if (player.getFirstTime() > self.currentUtcTime || self.currentUtcTime > player.getInitialLastTime()) return;
        player.play().catch(function(){});
      });
    }).finally(function(){
      delete self.play_reject; delete self.play_promise;
    });
    return this.play_promise;
  }
  pause(){
    clearTimeout(this.play_timer); if (this.play_reject) this.play_reject(); delete this.play_reject; delete this.play_promise;
    this.removeAttribute('autoplay');
//        this.setStatus('pause');
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player) return Promise.resolve();
    return player.pause();
  }

  // debug info
  onDebugInfo(){
    return '';
  }
  onResize(){
  //   let w = this.wplayers_layer.clientWidth;
  //   let h = this.wplayers_layer.clientHeight;
  //   if (!this.media_scale) return;
  //   if (!w || !h) {
  //     this.players_layer.style.width = '100%';
  //     this.players_layer.style.height= '100%';
  //     return;
  //   }
  //
  //   if (w/this.media_scale<=h)
  //     h = w/this.media_scale;
  //   else
  //     w = h*w/this.media_scale;
  //   this.players_layer.style.width = ''+w+'px';
  //   this.players_layer.style.height= ''+h+'px';
  }
  connectedCallback() {
    let self = this;
    this.setStatus('nodata');
    if (this.innerText=='') this.innerHTML='';
    this.shadow = this.attachShadow({mode: 'open'});
    let video_tag = 'k-video-reverse';
    if (typeof CKVideoReverse==="undefined" || this.getAttribute('noreverse')!==null) {
      if (typeof CKVideo==="undefined"){
        console.error('No CKVideo or CKVideoReverse class - player disabled');
        return;
      }
      video_tag = 'k-video';
    }

    const muted = this.hasAttribute('muted');
    let params = '';
    if (muted) {
      params += ' muted';
    }

    let pb = '<'+video_tag+params+' pos="0"></'+video_tag+'>';
    for (let i=0; i<this.LEFT_BUFFER_SIZE; i++) pb = '<'+video_tag+params+' pos="-'+(i+1)+'"></'+video_tag+'>' + pb;
    for (let i=0; i<this.RIGHT_BUFFER_SIZE; i++) pb += '<'+video_tag+params+' pos="'+(i+1)+'"></'+video_tag+'>';
    this.shadow.innerHTML = '<style>'+this.getCss()+'</style><iframe></iframe>'+(this.getAttribute('debuginfo')!==null?'<div class="debuginfo"></div>':'')+'<div class="wplayers"><div class="players">'+pb+'</div></div>';
    this.wplayers_layer = this.shadow.querySelector('.wplayers');
    this.players_layer = this.shadow.querySelector('.players');

    if (muted) {
      this.volume = 0;
    }

    this.shadow.querySelector('iframe').contentWindow.addEventListener('resize', function(e){self.onResize();});
    this.redux.subscribe('media_scale',function(event){
      if (!isNaN(parseFloat(event.detail.event_param.value)))
        self.media_scale = parseFloat(event.detail.event_param.value);
      self.onResize();
    });

    this.debuginfo = this.shadow.querySelector('.debuginfo');
    if (typeof this.updateDebugInfo=="function") this.updateDebugInfo();

    this.setListiners(this.shadow.querySelector('[pos="0"]'));

    for (let i = -this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++){
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (this.options.poster_play_duration!==undefined)
        p.poster_play_duration = this.options.poster_play_duration;
      p.addEventListener("error", function(e){
        self.dispatchEvent(new CustomEvent("error", {detail: (e.detail ? e.detail : { src: e.srcElement?e.srcElement:this}) }));
      },{once:false});
      p.addEventListener("loadedmetadata", function(event){
        let t = event.target2 ? event.target2 : event.target;
        let w = !event ? 0 : (t && t.videoWidth ? t.videoWidth : (event.detail&&event.detail.src&&event.detail.src.videoWidth?event.detail.src.videoWidth:0));
        let h = !event ? 0 : (t && t.videoHeight ? t.videoHeight : (event.detail&&event.detail.src&&event.detail.src.videoHeight?event.detail.src.videoHeight:0));
        if (w && h){
          if (self.last_media_scale!==w/h)
            self.redux.post(event.srcElement,'media_scale',{value:w/h});
          self.last_media_scale=w/h;
        }
//                self.dispatchEvent(new CustomEvent("loadedmetadata", {detail: { src: event.srcElement} }));
      },{once:false});
      p.addEventListener("readytoshow", function(){self.onReadyToShow(p);},{once:false});
    }
    /*
            for (let s of this.shadow.querySelectorAll('.players > *')) {
                s.setSourceForTimePromise = setSourceForTimePromise;
                s.setTimeWithSourcePromise = setTimeWithSourcePromise;
                s.updateState = updateState;
            }
    */
    this.speed=1;
    this.setSourceListObserver(this);

    this.addEventListener("loadstart", function(){
      let player = self.shadow.querySelector('[pos="0"]');
      if (player && player.isEmpty())
        self.setStatus('loading');
    },{once:false});
    this.addEventListener("waiting", function(){
      self.setStatus('loading');
    },{once:false});

    this.redux.subscribe("set_state", function(event){
      if (event && event.detail.event_param && event.detail.event_param.value) self.classList.add(event.detail.event_param.value);
    },{once:false});
    this.redux.subscribe("clear_state", function(event){
      if (event && event.detail.event_param && event.detail.event_param.value) self.classList.remove(event.detail.event_param.value);
    },{once:false});
  }
  setState(state){
    this.redux.send(this,'set_state',{value:state});
  }
  clearState(state){
    this.redux.send(this,'clear_state',{value:state});
  }
  setPlayTime(time){
    if (isNaN(time)) debugger;
    this.setAttribute('playtime', time);
  }
  setListiners(player){
    let self = this;
    let pl =  player;
    this.onTimeUpdateEvent = function(e){
      if (!self.shadow || !pl.isLoaded()) return;
      if (pl.isPlaying() && pl.playbackRate<0) self.setStatus('playing');
      const player = self.shadow.querySelector('[pos="0"]');
      if (!player || player.isEmpty()) return;
      let time = e&&e.detail&&!isNaN(e.detail.currentUtcTime) ? e.detail.currentUtcTime : player.currentUtcTime;
      if (time<=0) {
        return;
      }
      if (!isNaN(time)) {
        if (self.getAttribute('playtime')!=time && self.getAttribute('autoplay')!==null){
          self.prev_time = parseInt(self.getAttribute('playtime')||0);
          self.setPlayTime(time);
          let current_time = new Date().getTime();
          if (!self.last_time_update || current_time - self.last_time_update >500){
            setTimeout(function(){self.sendTimeUpdate();},0);
            self.last_time_update = current_time;
          }
        }
      }
    }
    this.onLoading = function(e){
      self.dispatchEvent(new Event('loadstart',{cancelable: false, bubbles: true}));
    }
    this.onPlayNextBlock = function(){
      let player = self.shadow.querySelector('[pos="0"]');
      if (!player) return;
      if (self.speed>=0){
        let lt = player.getInitialLastTime();
        if (lt!==undefined) {
          self.prev_time = parseInt(self.getAttribute('playtime')||0);
          self.setPlayTime(lt);
        }
      } else {
        let lt = player.getFirstTime();
        if (lt!==undefined) {
          self.prev_time = parseInt(self.getAttribute('playtime')||0);
          self.setPlayTime(lt-1);
        }
      }

      if (/*player.isEmpty() && */!self.checkNextBlock()){
        self.updateCache();
        return;
      }
      player = self.shiftToNextBlock();
      if (!player || player.isEmpty()){
        self.setStatus('nodata');
        return;
      }
      self.updateCache();
      if (!player.isError()){
        self.setPlayTime(self.speed>=0 ? player.getFirstTime() : player.getLastTime());
        self.setStatus('seeking',true);
        player.setTimePromise(self.speed>=0 ? player.getFirstTime() : player.getLastTime()).then(function(){
          player.setPlaybackRatePromise(self.speed);
          if (self.getAttribute('autoplay')!==null){
            self.setStatus('playing',false);
            player.play().catch(function(){});
          } else
            self.setStatus('pause',false);
        });
        return;
      } else
        self.setStatus('nodata');
    }
    this.onStatusUpdate = function(event){
      if (self.getAttribute('status')!='error')
        self.setStatus(event.status);
    }
    player.addEventListener("statusupdate", this.onStatusUpdate,{once:false});

//        player.addEventListener("seeking", this.onSeeking,{once:false});
//        player.addEventListener("seekend", this.onSeekend,{once:false});
    player.addEventListener("ended", this.onPlayNextBlock,{once:false});
    player.addEventListener("waiting", this.onLoading,{once:false});
    player.addEventListener("loadstart", this.onLoading,{once:false});
    player.addEventListener("timeupdate", this.onTimeUpdateEvent,{once:false});
  }
  getPoster(){
    return this.shadow.querySelector('[pos="0"]').poster;
  }

  setStatus(status, delay=false){
    clearTimeout(this.status_timer);
    if (this.getAttribute('status')===status) return;
    let self = this;
    if (!delay){
      this.setAttribute('status',status);
      let event_statusupdate = new Event('statusupdate',{cancelable: false, bubbles: true});
      event_statusupdate.status = status;
      this.dispatchEvent(event_statusupdate);
      return;
    }
    this.status_timer = setTimeout(function(){
      self.status_timer = undefined;
      self.setAttribute('status',status);
      let event_statusupdate = new Event('statusupdate',{cancelable: false, bubbles: true});
      event_statusupdate.status = status;
      self.dispatchEvent(event_statusupdate);
    },50);
  }
  getState(state){
    return this.classList.contains(state);
  }
  shiftToNextBlock(){
    if (this.disableAutoSkip) {
      const playtime = Number(this.getAttribute('playtime'));
      const currentPlayer = this.shadow.querySelector('[pos="0"]');
      if (playtime) {
        if (this.speed >= 0) {
          const nextPlayer = this.shadow.querySelector('[pos="1"]');
          if (!nextPlayer) {
            return currentPlayer;
          }
          const nextBlockTime = Number(nextPlayer.getAttribute('time'));
          if (!nextBlockTime || nextBlockTime > playtime + 500) {
            // this.pause().catch(() => {});
            return currentPlayer;
          }
        } else {
          const prevPlayer = this.shadow.querySelector('[pos="-1"]');
          if (!prevPlayer) {
            return currentPlayer;
          }
          let nextBlockTime = Number(prevPlayer.getAttribute('time'));
          if (!nextBlockTime) {
            return currentPlayer;
          }
          const duration = Number(prevPlayer.getAttribute('msecs'));
          nextBlockTime += duration;
          if (!nextBlockTime || nextBlockTime < playtime - 500) {
            // this.pause().catch(() => {});
            return currentPlayer;
          }
        }
      }
    }

    if (this.speed>=0){
      let p = this.shadow.querySelector('[pos="-'+this.LEFT_BUFFER_SIZE+'"]');
      for (let i = -this.LEFT_BUFFER_SIZE+1; i<=this.RIGHT_BUFFER_SIZE-1; i++){
        let np = this.shadow.querySelector('[pos="'+i+'"]');
        this.swapPlayers(p,np);
        np.pause().catch(function(){});
      }
      p.setSourcePromise().catch(function(err){});
      if (this.shadow.querySelector('[pos="0"]').isEmpty() && this.checkNextBlock()){
        p = this.shadow.querySelector('[pos="-'+this.LEFT_BUFFER_SIZE+'"]');
        for (let i = -this.LEFT_BUFFER_SIZE+1; i<=this.RIGHT_BUFFER_SIZE-1; i++){
          let np = this.shadow.querySelector('[pos="'+i+'"]');
          this.swapPlayers(p,np);
          np.pause().catch(function(){});
        }
        p.setSourcePromise().catch(function(err){});
      }
      return this.shadow.querySelector('[pos="0"]');
    }
    let p = this.shadow.querySelector('[pos="'+(this.RIGHT_BUFFER_SIZE-1)+'"]');
    for (let i = this.RIGHT_BUFFER_SIZE-2; i>=-this.LEFT_BUFFER_SIZE; i--){
      let np = this.shadow.querySelector('[pos="'+i+'"]');
      this.swapPlayers(p,np);
      np.pause().catch(function(){});
    }
    p.setSourcePromise().catch(function(err){});
    return this.shadow.querySelector('[pos="0"]');
  }
  removeListiners(player){
    player.removeEventListener("statusupdate", this.onStatusUpdate);

    player.removeEventListener("waiting", this.onLoading);
    player.removeEventListener("loadstart", this.onLoading);
//        player.removeEventListener("seeking", this.onSeeking);
//        player.removeEventListener("seekend", this.onSeekend);
    player.removeEventListener("ended", this.onPlayNextBlock);
    player.removeEventListener("error", this.onPlayNextBlock);
    player.removeEventListener("timeupdate", this.onTimeUpdateEvent);
    player.removeEventListener("loadedmetadata", this.onLoadedmetadata);
  }
  setSourceListObserver(v){
    let self = this;
    this.source_list_element = v;
    this.source_list_observer = new MutationObserver(function(mutations) {self.onSourceListChange(mutations);});
    this.source_list_observer.observe(v, {childList: true}); // attributes: true, characterData: true, subtree: true, attributeOldValue: true, characterDataOldValue: true,
  }
  onSourceListChange(mutations){
    this.updateCache();
  }
  setPlaybackRatePromise(speed){
    if ((typeof CKVideoReverse==="undefined" || this.getAttribute('noreverse')!==null) && speed<0) speed=0;
    let self = this;
    const player = this.shadow.querySelector('[pos="0"]');
    if (!player) return;
    this.speed = speed;
    if (speed>=0) this.removeAttribute('reverseplay');
    else this.setAttribute('reverseplay','');
    return player.setPlaybackRatePromise(speed).finally(function(){
      for (let i=self.LEFT_BUFFER_SIZE; i<=self.RIGHT_BUFFER_SIZE; i++) {
        if (i==0) continue;
        self.shadow.querySelector('[pos="'+i+'"]').setPlaybackRatePromise(speed);
      }
      if (parseInt(player.getAttribute('pos'))!==0) return;
      if (self.getAttribute('autoplay')!==null)
        return player.play().catch(function(){});
    }).catch(function(){});
  }
  updateCache(){
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player) return;
    let l = player.getInitialLastTime();
    if (l===undefined)
      l = this.currentUtcTime;


    let last_msec = parseInt(player.getAttribute('msec'))||0;
    if (!last_msec){
      // notification of the need to download the video block and posters for the specified time
      this.storage.getVideo(l);
      this.storage.getPoster(l);
    }
    let i=1;
    for (; last_msec>0 && i<=this.RIGHT_BUFFER_SIZE-1; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let np = this.getPlayerWithTimeRange(l,l+1);
      if (np && np!==player && np!=p){
        l = np.getInitialLastTime();
        this.swapPlayers(p,np);
        if (np.getAttribute('msec')==null || !parseInt(np.getAttribute('msec')))
          break;
        continue;
      }
      let videodata = this.storage.getVideo(l);
      let posterdata = this.storage.getPoster(l);

      if ((!videodata || !videodata.src) && posterdata && posterdata.src){
        let vt; let pt = posterdata.time+posterdata.msec;
        if (videodata) vt = videodata.time - videodata.msec
        let d = vt===undefined ? pt - l : (pt<vt?pt:vt) - l;

        let fastposterdata = this.storage.getNeighborPoster(l,true,true);
        p.setSourcePromise('', l, d, false).then(function(){
          p.setPoster(posterdata.src, fastposterdata?fastposterdata.src:'');
        },function(){});
        l+=d;
        continue;
      }

      if (videodata){
        l = videodata.time+Math.abs(videodata.msec);
        p.setSourcePromise(videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off).catch(function(err){});

        if (posterdata && posterdata.src) {
          if (p.poster != posterdata.src) p.poster = posterdata.src;
          continue;
        }
        let purl = this.storage.posters_cache.getNearCached(l);
        if (!purl) purl=this.storage.posters_cache.getNearByStartTime(l);
        if (purl) p.poster = purl.s;
        else {
          p.poster='';
          p.setAttribute('readytoshow','');
        }
        continue;
      }
      if (posterdata && posterdata.src){
        p.setSourcePromise('', l, 0, false).then(function(){
          if (posterdata && posterdata.src){
            if (p.poster != posterdata.src) p.poster = posterdata.src;
          } else p.poster='';
        },function(){});
        i++;
      }
      break;
    }
    for (; i<=this.RIGHT_BUFFER_SIZE-1; i++)
      this.shadow.querySelector('[pos="'+i+'"]').setSourcePromise().catch(function(err){});
    l = player.getFirstTime();
    i=-2;
    for (; last_msec>0 && l>0 && i>=-this.LEFT_BUFFER_SIZE; i--) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (l == p.getInitialLastTime()){
        l = p.getFirstTime();
        continue;
      }
      let np = this.getPlayerWithTimeEndRange(l-1,l);
      if (np){
        l = np.getFirstTime();
        this.swapPlayers(p,np);
        continue;
      }
      let videodata = this.storage.getVideo(l-1);
      let posterdata = this.storage.getPoster(l-1);
      if (videodata){
        l = videodata.time;
        if (videodata.time==0) posterdata = this.storage.getNeighborPoster(l,false,false);
        p.setSourcePromise(videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off).catch(function(){});
        if (posterdata && posterdata.src) {
          if (p.poster != posterdata.src) p.poster = posterdata.src;
        } else p.poster='';
        continue;
      }
      p.setSourcePromise('', l-1, 0, false).then(function(){
        if (posterdata && posterdata.src){
          if (p.poster != posterdata.src) p.poster = posterdata.src;
        } else p.poster='';
      },function(){});
      i--;
      break;
    }
    for (; i>=-this.LEFT_BUFFER_SIZE; i--)
      this.shadow.querySelector('[pos="'+i+'"]').setSourcePromise().catch(function(){});
  }
  onReadyToShow(player){
    let self = this;
    if (player.getAttribute('pos')=='0') return;
    if ( !(player.getAttribute('msec')=='0'&&this.currentUtcTime==player.getFirstTime()) && (this.currentUtcTime<player.getFirstTime() || this.currentUtcTime>=player.getInitialLastTime()) ) return;
    let p = this.shadow.querySelector('[pos="0"]');
    if (!p) return;
    let t = this.currentUtcTime>player.getInitialLastTime() ? player.getInitialLastTime() : this.currentUtcTime;
    if (!player.poster && !player.src) return;

    if (!!player.poster || t == player.currentUtcTime){
      this.swapPlayers(player,p);
      if (!player.src || player.isReadyForPlay())
        this.updateCache();
      if (!player.src) return;
      if (t != player.currentUtcTime)
        player.setTimePromise(t).then(function(){
          if (player.getAttribute('pos')=='0' && self.getAttribute('autoplay')!==null)
            player.play().catch(function(){});
          self.updateCache();
        },function(){
          if (player.getAttribute('pos')=='0' && self.getAttribute('autoplay')!==null)
            player.play().catch(function(){});
          self.updateCache();
        });
      else if (this.getAttribute('autoplay')!==null)
        player.play().catch(function(){});

      if (this.getAttribute('autoplay')!==null)
        this.setStatus('playing');
      else
        this.setStatus('pause');
    }
    player.setTimePromise(t).then(function(){
      self.onReadyToShow(player);
    },function(){});
  }
  videoLoaded(utctime, url, duration, timeoffset){
    let self = this;
    let playtime = parseInt(this.getAttribute('playtime'));
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player) return;
    let p = this.getPlayerWithTimeRange(parseInt(utctime), parseInt(utctime+Math.abs(duration)));
    if (!p || p===player && !!player.src || !!p.src) return;

    let d = Math.sign(duration)*parseInt(Math.abs(duration)+utctime-parseInt(utctime));

    p.setSourcePromise(url, parseInt(utctime), Math.abs(d), timeoffset).then(function(){
      if (p.getAttribute('pos')!=='0' || p.getAttribute('autoplay')===null) return;
      if (playtime == p.currentUtcTime) return p.play();
      p.setTimePromise(playtime).then(function(){
        if (p.getAttribute('pos')!=='0' || p.getAttribute('autoplay')===null) return;
        return p.play();
      });
    }).catch(function(){});
    if (p===player && this.isPlaying())
      player.setAttribute('autoplay','');

    if (duration<0){
      let pos = parseInt(p.getAttribute('pos'));
      if (pos<this.RIGHT_BUFFER_SIZE-2){
        let p2 = this.shadow.querySelector('[pos="'+(pos+1)+'"]');
        if (!p2.src && p2.getAttribute('msec')!==null)
          p2.setSourcePromise('', parseInt(utctime-duration), 0,0).catch(function(){});
      } else
        this.updateCache();
    } else
      this.updateCache();
  }
  posterLoaded(utctime, url, duration){
    let self = this;
    let playtime = parseInt(this.getAttribute('playtime'));
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player) return;
    if (player.isEmpty() && !player.poster) {
      let cplayer = self.shadow.querySelector('[pos="'+self.RIGHT_BUFFER_SIZE+'"]');
      if (self.first_poster_utctime===undefined || Math.abs(self.first_poster_utctime-cplayer.currentUtcTime) > Math.abs(utctime-cplayer.currentUtcTime)){
        clearTimeout(this.first_poster_timer);
        self.first_poster_timer = setTimeout(function(){
          self.shadow.querySelector('[pos="'+self.RIGHT_BUFFER_SIZE+'"]').poster = url;
        },0);
      }
    }
    let p = this.getAllPlayersWithTimeRange(utctime, utctime+Math.abs(duration));
    if (!p) return;
    for (let i in p){
      let u2=url;
      if (!p.hasOwnProperty(i)) continue;
      if (!url){
        let r = this.storage.posters_cache.getNearCached(p[i].getFirstTime());
        if (!r)
          r = this.storage.posters_cache.getNearByStartTime(p[i].getFirstTime());
        if (r && r.s)
          u2 = r.s;
      }
      if (p[i]===player){
        if (p[i].src) continue;
        if (p[i].poster==url && p[i].getFirstTime()==utctime) continue;
        self.invalidatePlayers();
        self.setTimePromise(playtime).catch(function(){});
        return;
      }
      if (!p[i].src && p[i].getFirstTime()!=utctime){
        p[i].setSourcePromise('', utctime, Math.abs(duration), false);
      }
      p[i].poster = u2;
    }
  }
  setPlayerTimePromise(p, utctime){
    clearTimeout(this.settime_timer);
    if (this.settime_reject) this.settime_reject(); delete this.settime_reject;
    let self = this;
    this.settime_promise = new Promise(function(resolve, reject){
      self.settime_timer = setTimeout(resolve, 0);
      self.settime_reject = reject;
    }).then(function(){
      return p.setTimePromise(utctime).then(function(){
        delete self.settime_reject;
        delete self.settime_promise;
        return self.setTimePromise(utctime);
      },function(){
        delete self.settime_promise;
        delete self.settime_reject;
      });
    });
    return this.settime_promise;
  }
  setPlayerSourcePromise(p, src, utc_from_in_msec, duration_msec, full_load, off){
    clearTimeout(this.settime_timer);
    if (this.settime_reject) this.settime_reject(); delete this.settime_reject;
    let self = this;
    this.settime_promise = new Promise(function(resolve, reject){
      self.settime_timer = setTimeout(resolve, 0);
      self.settime_reject = reject;
    }).then(function(){
      return p.setSourcePromise(src, utc_from_in_msec, duration_msec, full_load, off).then(function(){
        delete self.settime_reject;
        delete self.settime_promise;
      },function(){
        delete self.settime_promise;
        delete self.settime_reject;
      });
    });
    return this.settime_promise;
  }

  setTimePromise1(utctime){
    let debug = 0;
    if (debug)console.log("setTimePromise pos: -> " + new Date(utctime).toISOString());  
    if (isNaN(utctime)) return;

    clearTimeout(this.settime_timer);
    if (this.settime_reject) this.settime_reject(); delete this.settime_reject;
    let self = this;

    // Update time
    this.setPlayTime(utctime);
    this.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:utctime}}));
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player)
      {
        if (debug)console.log("setTimePromise error can not find the player !!!!");
         return new Promise(function(resolve, reject){resolve();});
      } 
    // Pause player 
    player.pause().catch(function(){});
    let p = this.getPlayerWithTime(utctime);
    if (debug)console.log("setTimePromise getPlayerWithTime p -> " + p);
    while (player===p){
      let posterdata = this.storage.getPoster(utctime);
      let r = player.setTimePromise(utctime).catch(function(){});
      if (!player.src && !player.poster) {
        let v = this.storage.getVideo(utctime);
        if (v && parseInt(player.getFirstTime())!==parseInt(v.time)){
          p = undefined;
          if (debug)console.log("setTimePromise invalidatePlayers ");
          this.invalidatePlayers();
          break;
        }
      }
      if (posterdata && posterdata.src && player.poster!=posterdata.src)
        player.setPoster(posterdata.src);
      return r;
    }


    if (p && parseInt(p.getAttribute('pos'))!==this.RIGHT_BUFFER_SIZE){
      if (!p.isReadyToShow()) return Promise.resolve();
      this.setStatus('seeking');
      if (p.currentUtcTime == utctime){
        this.swapPlayers(player,p);
        this.updateCache();
        if (p.isEmpty())
          this.setStatus('nodata');
        else {
          if (this.getAttribute('autoplay')!==null)
            p.play().catch(function(){});
          else
            this.setStatus('pause');
        }
        if (debug)console.log("setTimePromise Promise.resolve() ");
        return Promise.resolve();
      }
      if (debug)console.log("setTimePromise setPlayerTimePromise ");
      return this.setPlayerTimePromise(p,utctime);
    }

    
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE-1; i++){
      if (i==0) continue;
      let t = this.shadow.querySelector('[pos="'+i+'"]');
      t.poster='';
      if (debug)console.log("setTimePromise setSourcePromise ");
      t.setSourcePromise().catch(function(){});
    }
    

    p = this.shadow.querySelector('[pos="'+this.RIGHT_BUFFER_SIZE+'"]');
    let videodata = this.storage.getVideo(utctime);
    if (debug)console.log("setTimePromise time=" +  new Date((videodata)?videodata.time:0).toISOString() +" videodata=" +  JSON.stringify(videodata));
    

    let fastposterdata = this.storage.getNeighborPoster(utctime, this.prev_time!==undefined && this.prev_time>utctime);
    if (debug)console.log("setTimePromise fastposterdata=" + fastposterdata);

    if (fastposterdata){
      let step = this.storage.posters_cache.preview_step || 60000*60;
      if (this.prev_time!==undefined && this.prev_time>utctime){
        if (utctime - fastposterdata.time > step*5) fastposterdata = undefined;
      } else
      if (fastposterdata.time - utctime > step*5) fastposterdata = undefined;
    }
    if (fastposterdata) fastposterdata = fastposterdata.src;
    if (player.poster)
      fastposterdata = player.poster;
    this.prev_time = utctime;


    let posterdata = this.storage.getPoster(utctime);
    if (debug)console.log("setTimePromise getPoster " + posterdata);


    if ((!videodata || !videodata.src) && posterdata && posterdata.src){
      let vt; let pt = posterdata.time+Math.abs(posterdata.msec);
      if (videodata) vt = videodata.time - videodata.msec;
      let d = vt===undefined ? pt - utctime : (pt<vt?pt:vt) - utctime;

      if (debug)console.log("setTimePromise setPlayerSourcePromise1 utctime=" +  utctime);
      return this.setPlayerSourcePromise(p, '', utctime, d, false).then(function(){
        p.setPoster(posterdata.src, fastposterdata?fastposterdata:'');
      },function(){});
    }

    if (videodata && videodata.time==0)
    {
      posterdata = this.storage.getNeighborPoster(0,false,false);
      if (debug)console.log("setTimePromise getNeighborPoster posterdata="+posterdata);
    }
      
    
    let ps = '';
    if (posterdata && posterdata.p) fastposterdata = undefined;
    if (posterdata && posterdata.src){
      if (!videodata) 
        {
          if (debug)console.log("setTimePromise setPlayerSourcePromise2 utctime=" +  utctime);
          return this.setPlayerSourcePromise(p, '', utctime, 0, false).then(function(){
          p.setPoster(posterdata.src,fastposterdata);
        })
      }
      if (debug)console.log("setTimePromise setPlayerSourcePromise3 utctime=" +  utctime);
      return this.setPlayerSourcePromise(p, videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off).then(function(){
        p.setPoster(posterdata.src,fastposterdata);
      })
      ps = posterdata.src;
    } else
      ps = '';

    if (videodata){
      if (videodata.time == 0)
      {
        //videodata.time = utctime;
        if (debug)console.warn("setTimePromise videodata.time-> change on new value time=" + videodata.time);
      }
      if (debug)console.warn("setTimePromise setPlayerSourcePromise4 p=" + p + " videodata.time:" + videodata.time);
      let ret = this.setPlayerSourcePromise(p, videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off);
      self.onReadyToShow(p);
      //p.setPoster(ps,fastposterdata);
      //player.play().catch(function(){});
      return ret;
    }

    if (debug)console.warn("setTimePromise setPlayerSourcePromise5 time=" + utctime);
    let ret = this.setPlayerSourcePromise(p, '', utctime, 0, false);
    //p.setPoster(ps,fastposterdata);
    return ret;
  }
  
  
  
  setTimePromise(utctime){
    if (isNaN(utctime)) return;
    clearTimeout(this.settime_timer);
    if (this.settime_reject) this.settime_reject(); delete this.settime_reject;
    let self = this;
    this.setPlayTime(utctime);
    this.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:utctime}}));
    let player = this.shadow.querySelector('[pos="0"]');
    if (!player) return new Promise(function(resolve, reject){resolve();});
    player.pause().catch(function(){});
    let p = this.getPlayerWithTime(utctime);
    while (player===p){
      let posterdata = this.storage.getPoster(utctime);
      let r = player.setTimePromise(utctime).catch(function(){});
      if (!player.src && !player.poster) {
        let v = this.storage.getVideo(utctime);
        if (v && parseInt(player.getFirstTime())!==parseInt(v.time)){
          p = undefined;
          this.invalidatePlayers();
          break;
        }
      }
      if (posterdata && posterdata.src && player.poster!=posterdata.src)
        player.setPoster(posterdata.src);
      return r;
    }
    if (p && parseInt(p.getAttribute('pos'))!==this.RIGHT_BUFFER_SIZE){
      if (!p.isReadyToShow()) return Promise.resolve();
      this.setStatus('seeking');
      if (p.currentUtcTime == utctime){
        this.swapPlayers(player,p);
        this.updateCache();
        if (p.isEmpty())
          this.setStatus('nodata');
        else {
          if (this.getAttribute('autoplay')!==null)
            p.play().catch(function(){});
          else
            this.setStatus('pause');
        }
        return Promise.resolve();
      }
      return this.setPlayerTimePromise(p,utctime);

    }

    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE-1; i++){
      if (i==0) continue;
      let t = this.shadow.querySelector('[pos="'+i+'"]');
      t.poster='';
      t.setSourcePromise().catch(function(){});
    }

    p = this.shadow.querySelector('[pos="'+this.RIGHT_BUFFER_SIZE+'"]');
    let videodata = this.storage.getVideo(utctime);

    let fastposterdata = this.storage.getNeighborPoster(utctime, this.prev_time!==undefined && this.prev_time>utctime);
    if (fastposterdata){
      let step = this.storage.posters_cache.preview_step || 60000*60;
      if (this.prev_time!==undefined && this.prev_time>utctime){
        if (utctime - fastposterdata.time > step*5) fastposterdata = undefined;
      } else
      if (fastposterdata.time - utctime > step*5) fastposterdata = undefined;
    }
    if (fastposterdata) fastposterdata = fastposterdata.src;
    if (player.poster)
      fastposterdata = player.poster;
    this.prev_time = utctime;

    let posterdata = this.storage.getPoster(utctime);

    if ((!videodata || !videodata.src) && posterdata && posterdata.src){
      let vt; let pt = posterdata.time+Math.abs(posterdata.msec);
      if (videodata) vt = videodata.time - videodata.msec;
      let d = vt===undefined ? pt - utctime : (pt<vt?pt:vt) - utctime;

      return this.setPlayerSourcePromise(p, '', utctime, d, false).then(function(){
        p.setPoster(posterdata.src, fastposterdata?fastposterdata:'');
      },function(){});
    }

    if (videodata && videodata.time==0)
      posterdata = this.storage.getNeighborPoster(0,false,false);
    let ps = '';
    if (posterdata && posterdata.p) fastposterdata = undefined;
    if (posterdata && posterdata.src){
      if (!videodata) 
        return this.setPlayerSourcePromise(p, '', utctime, 0, false).then(function(){
        p.setPoster(posterdata.src,fastposterdata);
      })
      return this.setPlayerSourcePromise(p, videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off).then(function(){
        p.setPoster(posterdata.src,fastposterdata);
      })
      ps = posterdata.src;
    } else
      ps = '';
    if (videodata){
      let ret = this.setPlayerSourcePromise(p, videodata.src, videodata.time, Math.abs(videodata.msec), false, videodata.off);
      self.onReadyToShow(p);
      //p.setPoster(ps,fastposterdata);
      return ret;
    }

    let ret = this.setPlayerSourcePromise(p, '', utctime, 0, false);
    //p.setPoster(ps,fastposterdata);
    return ret;
  }
  getTime(){
    const player = this.shadow.querySelector('[pos="0"]');
    return player.currentUtcTime();
  }
  swapPlayers(v1, v2){
    let pos1 = parseInt(v1.getAttribute('pos'));
    let pos2 = parseInt(v2.getAttribute('pos'));
    if (pos1 == pos2 || v1==v2) return;
    if (pos1==0) this.removeListiners(v1);
    if (pos2==0) this.removeListiners(v2);

    v1.setAttribute('pos',pos2);
    v2.setAttribute('pos',pos1);

    if (pos1==0) this.setListiners(v2);
    if (pos2==0) this.setListiners(v1);
    let event_videochanged = new Event('videochanged',{cancelable: false, bubbles: true});
    event_videochanged.video = this.shadow.querySelector('[pos="0"]');
    this.dispatchEvent(event_videochanged);
    if (event_videochanged.video.isEmpty())
      this.setStatus('nodata');
  }
  getPlayerWithTimeEndRange(from, to){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let time = parseInt(p.getAttribute('time'));
      let msec = parseInt(p.getAttribute('msec'));
      if (isNaN(time) || isNaN(msec)) continue;
      if (from <= time+msec && time+msec<to)
        return p;
    }
  }
  getPlayerWithTimeRange(from, to){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let time = parseInt(p.getAttribute('time'));
      if (isNaN(time)) continue;
      if (from <= time && time<to)
        return p;
    }
  }
  getPlayerWithIntersectTime(from, to){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let time = parseInt(p.getAttribute('time'));
      let msec = parseInt(p.getAttribute('msec'));
      if (isNaN(time)||isNaN(msec)) continue;
      if (from <= time && time<to || from <= time+msec && time+msec<to || time <= from && from < time+msec || time <= to && to < time+msec)
        return p;
    }
  }
  getAllPlayersWithTimeRange(from, to){
    let ret=[];
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let time = parseInt(p.getAttribute('time'));
      let msec = parseInt(p.getAttribute('msec'));
      if (isNaN(time)||isNaN(msec)) continue;
      if (from <= time && time<to || from < time+msec && time+msec<=to || time <= from && from < time+msec || time <= to && to < time+msec)
        ret.push(p);
    }
    return ret;
  }
  getPlayerWithTime(utctime){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      let time = parseInt(p.getAttribute('time'));
      let msec = parseInt(p.getAttribute('msec'));
      if (isNaN(time) || isNaN(msec)) continue;
      if (time <= utctime && utctime < time+msec)
        return p;
    }
  }
  getPlayerWithSrc(src){
    if (!src) return;
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++) {
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (p.src==src)
        return p;
    }
  }
  invalidateEmptyPlayers(start_time, end_time){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE-1; i++){
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (i==0 || p.src || p.getFirstTime()==p.getLastTime()) continue;
      if (start_time<=p.getFirstTime() && p.getFirstTime()<end_time ||
        start_time<=p.getLastTime() && p.getLastTime()<end_time ||
        p.getFirstTime()<=start_time && start_time<p.getLastTime() ||
        p.getFirstTime()<=end_time && end_time<p.getLastTime()) {
        p.setSourcePromise().catch(function(){});
        p.poster='';
        p.removeAttribute('poster');
        p.load();
      }
    }
  }
  invalidatePlayers(all){
    for (let i=-this.LEFT_BUFFER_SIZE; i<=this.RIGHT_BUFFER_SIZE; i++){
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (!p) continue;
      if (all!==true && i===0){
        p.removeAttribute('time');
        p.removeAttribute('msec');
        continue;
      }
      p.setSourcePromise().catch(function(){});
      p.poster='';
      p.removeAttribute('poster');
      p.load();
    }
  }
  invalidate(){
    let self = this;
//        return this.pause().finally(function(){
    self.invalidatePlayers();
    self.setStatus('nodata');
//        }).catch(function(){});
  }

  checkNextBlock(){
    if (this.speed>=0) return this.checkAfter();
    return this.checkBefore();
  }
  checkBefore(){
    let i = -this.LEFT_BUFFER_SIZE;
    for (; i<0; i++){
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (!p.isEmpty() && p.isReadyToShow()) break;
    }
    if (i==0) return false;
    return true;
  }
  checkAfter(){
    let i = 1;
    for (; i<=this.RIGHT_BUFFER_SIZE; i++){
      let p = this.shadow.querySelector('[pos="'+i+'"]');
      if (!p.isEmpty() && p.isReadyToShow()) break;
    }
    if (i>this.RIGHT_BUFFER_SIZE) return false;
    return true;
  }
  getLastTime(){
    let ret=0;
    for(let srcelement of this.source_list_element.children) {
      let time = srcelement.getAttribute('time');
      let msec = srcelement.getAttribute('msec');
      if (time===null || msec===null) continue;
      time = parseInt(time);
      if (isNaN(time)) continue;
      msec = parseInt(msec);
      if (isNaN(msec)) continue;
      if (ret<time+msec) ret=time+msec;
    }
    return ret;
  }
  disconnectedCallback(){
    this.invalidate();
    this.removeListiners(this.shadow.querySelector('[pos="0"]'));
    this.shadow.innerHTML='';
  }

  getCss() {
    return `
iframe{position: absolute;left: 0;right: 0;top: 0;bottom: 0;width: 100%;height: 100%;border: 0;opacity: 0;z-index: -1000;}
.wplayers{width:100%;height:100%;position:relative;display:flex;}
.players{max-width:100%;max-height:100%;position:relative;margin: auto auto;width: 100%;height: 100%;}
.players>*{position:absolute;width:100%;height:100%;left:0;}
.posters_info{display: flex;display: flex;flex-direction: row;justify-content: space-between;align-items: baseline;}
.posters_info div:first-child,.posters_info div:last-child{font-size:80%;color: gray;}
.posters_info div:last-child{text-align:right;}
.posters_preview{width:100%;height:10px;border:1px solid gray;background-color:lightgray;position:relative}
.posters_preview div{display:inline-block;height:100%;position:absolute;min-width:1px;}
.posters_preview div.full{background-color:#ffff;}
.posters_preview div.empty{background-color:#000;}
.cachetable{width:100%;height:1em;display:flex;}
.cachetable > div{text-align:center;background:lightgray;flex:1;border:1px solid darkslategray;height:1.2em;width:20px;overflow:hidden;font-size:9px;margin-left:-1px;cursor:pointer;}
.cachetable .center{border:1px solid white;position:relative;z-index:1000;}
.cachetable .error{background:#ff5050;}
.cachetable .ready{background:#50ff50;}
.cachetable .wait{background:#ffff50;}
.players>*:not([pos="0"]),.players>*[status="error"]{visibility:hidden;}
.debuginfo{font-size:12px;position:absolute;background:#ffffffc0;padding:10px;z-index:10000;font-family:monospace;display:none;top:50px;}
.cachetable > div:hover{border:1px solid blue;}
`;
  }
}

window.customElements.define('k-video-set', CKVideoSet);
class CTimeRange{
    constructor(default_data) {
        this.min_space_time = 0;
        if (default_data!==undefined){
            this.range_data = [];
            this.default_data = default_data;
        }
        this.invalidate();
    }
    getDurationSum(){
        let ret=0;
        for (let i=0;i<this.range_durations.length;i++) if (this.range_durations[i]>0) ret += this.range_durations[i];
        return ret;
    }
    getView(no_width){
        let ft = this.getFirstTime();
        let range = this.getLastTime() - ft;
        let ars=[];
        for (let i=0;i<this.range_durations.length;i++){
            let w = Math.abs(this.range_durations[i]) / range;
            let t = (this.range_durations[i]>0?'full':'empty');
            if (i>0 && this.range_times[i-1]+Math.abs(this.range_durations[i-1])<this.range_times[i]){
                if (ars.length && ars[ars.length-1].t == '')
                    ars[ars.length-1].w += this.range_times[i]-this.range_times[i-1]-Math.abs(this.range_durations[i-1]);
                else
                    ars.push({s:(this.range_times[i-1]-ft)/range,w:(this.range_times[i]-this.range_times[i-1]-Math.abs(this.range_durations[i-1]))/range,t:''});
            }
            if (ars.length && ars[ars.length-1].t == t)
                ars[ars.length-1].w += w;
            else
                ars.push({s:(this.range_times[i]-ft)/range,w:w,t:t});
        }
        let ret1='',ret2='',ret3='';
        for (let i=0;i<ars.length;i++){
            if (ars[i].t=='full'){
                let w = no_width ? '' : 'width:'+(ars[i].w*100)+'%';
                ret1 += '<div class="'+ars[i].t+'" style="left:'+(ars[i].s*100)+'%;'+w+'"></div>';
            } else if (ars[i].t=='empty')
                ret2 += '<div class="'+ars[i].t+'" style="left:'+(ars[i].s*100)+'%;width:'+(ars[i].w*100)+'%"></div>';
            else
                ret3 += '<div class="'+ars[i].t+'" style="left:'+(ars[i].s*100)+'%;width:'+(ars[i].w*100)+'%"></div>';
        }
        return ret3+ret2+ret1;
    }
    invalidate(){
        if (this.abort_controller) this.abort_controller.abort();
        clearTimeout(this.preview_preload_timer);
        this.range_times = [];
        this.range_durations = [];
        this.range_expires = [];
        if (this.range_data) this.range_data = [];
    }
    isEmpty(){
        return !this.range_times.length;
    }
    getFirstTime(){
        if (this.isEmpty()) return;
        return this.range_times[0];
    }
    getLastTime(){
        if (this.isEmpty()) return;
        return this.range_times[this.range_times.length-1] + Math.abs(this.range_durations[this.range_times.length-1]);
    }
    getLastKnownTime(){
        for (let i=this.range_times.length-1;i>=0;i--){
            if (this.range_durations[i]>0)
                return this.range_times[i] + Math.abs(this.range_durations[i]);
        }
    }
    clearExpired(){
        if (this.isEmpty()) return;
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_durations[i]>0 || this.range_expires[i]+5000 > Date.now()) continue;
            this.range_times.splice(i, 1);
            this.range_durations.splice(i, 1);
            this.range_expires.splice(i, 1);
            if (this.range_data) this.range_data.splice(i, 1);
        }
    }
    getFirstSpace(){
        if (this.isEmpty()) return;
        for (let i=0;i<this.range_times.length-1;i++){
            let l = this.range_times[i]+Math.abs(this.range_durations[i]);
            if (l !== this.range_times[i+1]) return l;
        }
    }
    getLastSpace(){
        if (this.isEmpty()) return;
        for (let i=this.range_times.length-1;i>0;i--)
            if (this.range_times[i-1]+Math.abs(this.range_durations[i-1]) !== this.range_times[i]) return this.range_times[i];
    }
    getRangeWithTimeIndex(time){
        for (let i=0;i<this.range_times.length;i++){
            if (time < parseInt(this.range_times[i]) || parseInt(this.range_times[i]+Math.abs(this.range_durations[i])) <= time) continue;
            return i;
        }
    }
    getSpaceWithTime(time){
        if (!this.range_times.length) return;
        if (this.range_times[0]>time)
            return {time:0,msec:this.range_times[0],src:'',off:0};
        for (let i=0;i<this.range_times.length;i++){
            let e = this.range_times[i]+Math.abs(this.range_durations[i]);
            if (i!=this.range_times.length-1 && time>=parseInt(e) && time<parseInt(this.range_times[i+1]))
                return {time:e,msec:this.range_times[i+1]-e,src:'',off:0};
            if (time<e) break;
        }
    }
    getRangeWithTime(time){
        for (let i=0;i<this.range_times.length;i++){
            if (time < parseInt(this.range_times[i]) || parseInt(this.range_times[i]+Math.abs(this.range_durations[i])) <= time) continue;
            if (this.default_data===undefined)
                return {time:this.range_times[i],msec:this.range_durations[i]};
            return {time:this.range_times[i],msec:this.range_durations[i],src:this.range_data[i].s,off:this.range_data[i].o};
        }
    }
    getNearCachedIndex(time, reverse){
        if (reverse){
            for (let i=this.range_times.length-1;i>=0;i--)
                if (this.range_times[i]<time && this.range_data[i].p)
                    return i;
        } else {
            for (let i=0;i<this.range_times.length;i++)
                if (this.range_times[i]>=time && this.range_data[i].p)
                    return i;
        }
    }
    getNearWithDataIndex(time, reverse){
        if (reverse){
            for (let i=this.range_times.length-1;i>=0;i--)
                if (this.range_times[i]<time && (!!this.range_data[i].s))
                    return i;
        } else {
            for (let i=0;i<this.range_times.length;i++)
                if (this.range_times[i]>=time && (!!this.range_data[i].s))
                    return i;
        }
    }
/*
    getNearCached(time, reverse){
        if (reverse){
            for (let i=this.range_times.length-1;i>=0;i--)
                if (this.range_times[i]<time && this.range_data[i].s.substr(0,5)==='blob:')
                    return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
        } else {
            for (let i=0;i<this.range_times.length;i++)
                if (this.range_times[i]>=time && this.range_data[i].s.substr(0,5)==='blob:')
                    return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
        }
    }
*/
    getNearCached(time){
        let i=0;
        for (;i<this.range_times.length;i++)
            if ((i==this.range_times.length-1 || this.range_times[i+1]>=time) && this.range_data[i].s.substr(0,5)==='blob:')
                break;
        if (i==this.range_times.length) return;
        let j=i+1;
        for (;j<this.range_times.length;j++)
            if (this.range_data[j].s.substr(0,5)==='blob:')
                break;
        if (j!=this.range_times.length && this.range_times[j]-time < time-this.range_times[i])
            return {s:this.range_data[j].s,t:this.range_times[j],o:this.range_data[j].o};
        return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
    }
    getNearByStartTime(time){
        if (!this.range_times.length) return;
        if (this.range_times.length<2) return {s:this.range_data[0].s,t:this.range_times[0],o:this.range_data[0].o};
        if (this.range_times[this.range_times.length-1]<=time) return {s:this.range_data[this.range_times.length-1].s,t:this.range_times[this.range_times.length-1],o:this.range_data[this.range_times.length-1].o};
        let i=0,j=-1;
        for (;i<this.range_times.length;i++){
            if (this.range_durations[i]>=0 && this.range_times[i]>=time)
                break;
            if (this.range_durations[i]>=0) j=i;
        }
        if (i>=this.range_times.length && j<0) return;
        if (i<this.range_times.length && j<0) return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
        if (i>=this.range_times.length && j>=0) return {s:this.range_data[j].s,t:this.range_times[j],o:this.range_data[j].o};

        if (this.range_times[i]-time < time-this.range_times[j])
            return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
        return {s:this.range_data[j].s,t:this.range_times[j],o:this.range_data[j].o};
    }
    // Return undefined if block with this time no exist
    // Return true or false, if block exist and with/no data
    checkData(time){
        if (this.isEmpty()) return;
        for (let i=0;i<this.range_times.length;i++)
            if (this.range_times[i]<=time && parseInt(this.range_times[i])+Math.abs(this.range_durations[i])>time) return this.range_durations[i]>0;
    }
    // Return neighbor block with data or undefined
    getNeighborWithDataIndex(time, reverse){
        for (let i=0;i<this.range_times.length;i++){
            if (parseInt(this.range_times[i])+Math.abs(this.range_durations[i]) <= time)
                continue;
            if ((!i || (parseInt(this.range_times[i-1])+Math.abs(this.range_durations[i-1])<=time)) && parseInt(this.range_times[i])>time) return;
            if (this.range_durations[i]>=0) return i;
            if (reverse){
                if (!i || this.range_durations[i-1]<0) return;
                return i-1;
            }
            if (i>=this.range_times.length-1 || this.range_durations[i+1]<0) return;
            return i+1;
        }
    }
    // return block index with selected time or undefined
    getIndexFromTime(time){
        if (!this.range_times || !this.range_times.length || this.range_times[this.range_times.length-1]+Math.abs(this.range_durations[this.range_times.length-1])<=time) return;
/*
        let i;
        for (i=0;i<this.range_times.length;i++){
            if (parseInt(this.range_times[i])>time) break;
            if (time < parseInt(this.range_times[i])+Math.abs(this.range_durations[i]))
                break;;
        }
*/
        let ii = 0, j = this.range_times.length, k;
        while (ii < j) {
            k = Math.floor((ii+j)/2);
            if (time <= this.range_times[k]) j = k;
            else ii = k+1;
        }
        if (!ii) return;
        if (ii!=this.range_times.length && this.range_times[ii]==time)
            return ii;
        if (this.range_times[ii-1]<=time && this.range_times[ii-1]*1000+Math.abs(this.range_durations[ii-1])*1000>time*1000)
            return ii-1;

    }
    getDataFromTime(time){
        if (this.default_data===undefined) return;
        for (let i=0;i<this.range_times.length;i++){
            if (time < parseInt(this.range_times[i]) || parseInt(this.range_times[i])+Math.abs(this.range_durations[i]) <= time) continue;
            return {s:this.range_data[i].s,t:this.range_times[i],o:this.range_data[i].o};
        }
    }
    setDataFromData(new_data, old_data){
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_data[i].s===old_data){
                this.range_data[i].s = new_data;
                break;
            }
        }
    }
    getFirstKnownTime(time, reverse){
        if (this.isEmpty()) return;
        if (!reverse)
            for (let i=0;i<this.range_times.length;i++){
                if (this.range_durations[i]<0) continue;
                if (this.range_times[i]<=time && this.range_times[i]+this.range_durations[i]>time) return time;
                if (this.range_times[i]<time) continue;
                if (this.range_durations[i]>0) return this.range_times[i];
            }
        else
            for (let i=this.range_times.length-1;i>=0; i--){
                if (this.range_times[i]>=time || this.range_durations[i]<0) continue;
                if (this.range_times[i]+this.range_durations[i]>time) return time;
                if (this.range_times[i]+this.range_durations[i]<=time) return this.range_times[i]+this.range_durations[i];
            }
    }
    checkRange(from, to){
        if (this.isEmpty()) return false;
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_durations[i]<0) continue;
            let e = parseInt(this.range_times[i])+Math.abs(this.range_durations[i]);
            if ((parseInt(this.range_times[i])>=from && parseInt(this.range_times[i])<to) || (e>=from && e<to) || (parseInt(this.range_times[i])<from && e>to)) return true;
        }
        return false;
    }
    checkActually(from, to){
        this.clearExpired();
        if (this.isEmpty()) return false;
        for (let i=0;i<this.range_times.length;i++){
            let e = parseInt(this.range_times[i])+Math.abs(this.range_durations[i]);
            if (e < from) continue;
            let le = i==0?0:parseInt(this.range_times[i-1])+Math.abs(this.range_durations[i-1]);
            if (from < parseInt(this.range_times[i]) && (!le || le!=parseInt(this.range_times[i])) )
                return false;
            if (e>=to) return true;
        }
        return false;
    }
    checkFilled(from, to){
        if (this.isEmpty()) return false;
        for (let i=0;i<this.range_times.length;i++){
            let e = parseInt(this.range_times[i])+Math.abs(this.range_durations[i]);
            if (e < from) continue;
            let le = i==0?0:parseInt(this.range_times[i-1])+Math.abs(this.range_durations[i-1]);
            if (this.range_durations[i]<0 || from < parseInt(this.range_times[i]) && (!le || le!=parseInt(this.range_times[i])) )
                return false;
            if (e>=to) return true;
        }
        return false;
    }
    autoPreload(time, step){
        let self = this;
        this.preview_time = time;
        this.preview_step = step;
        this.preview_reload = true;
        if (this.preview_preload_timer) return;
        function preload(url){
            if (!url) return Promise.resolve();
            console.log('-------- autoPreload', url);
            let image = new Image();
            image.crossOrigin="anonymous";
            let load_promise_resolve;
            let load_promise_reject;
            image.onload = function(e){
                load_promise_resolve();
            }
            image.onerror = function(e){
                load_promise_reject();
            }
            return new Promise(function(resolve, reject){
                load_promise_resolve = resolve;
                load_promise_reject = reject;
                image.src = url;
            });
/*
            self.abort_controller = new AbortController();
            return fetch(url,{signal:self.abort_controller.signal, headers: { range: 'bytes=0-100000000' } }).then(function(res){
                return res.blob().then(function(blob){
                    return window.URL.createObjectURL(blob);
                });
            }).finally(function(){
                self.abort_controller = undefined;
            });
*/
        }
        function preload_preview(){
            if (!self.range_times || !self.range_times.length) {
                self.preview_preload_timer = undefined;
                return;
            }
            const rtime = self.preview_time+200*self.preview_step < self.getLastTime() ? self.preview_time+200*self.preview_step : self.getLastTime();
            const ltime = self.preview_time-200*self.preview_step > self.getFirstTime() ? self.preview_time-200*self.preview_step : self.getFirstTime();

            let right_index,left_index,right_time,left_time;
            for (right_time= self.preview_time;right_time<rtime; right_time+=10*self.preview_step){
                right_index = self.getRangeWithTimeIndex(right_time);
                if (right_index!==undefined && !self.range_data[right_index].p && self.range_durations[right_index]>0 && (!!self.range_data[right_index].s)) break;
            }
            if (right_index!==undefined && (right_index>=self.range_data.length || self.range_durations[right_index]<0 || !self.range_data[right_index].s))
                right_index = undefined;

            if (right_index!==undefined && (self.range_data[right_index].p || self.range_durations[right_index]<0)) right_index=undefined;
            for (left_time = self.preview_time-10*60000;left_time>ltime; left_time-=10*self.preview_step){
                left_index = self.getRangeWithTimeIndex(left_time);
                if (left_index!==undefined && !self.range_data[left_index].p && self.range_durations[left_index]>0 && (!!self.range_data[left_index].s)) break;
            }
            if (left_index!==undefined && (self.range_data[left_index].p || !self.range_data[left_index].s || self.range_durations[left_index]<0)) left_index=undefined;
            if (right_index===undefined && left_index===undefined) {
                self.preview_preload_timer = undefined;
                return;
            }

            let index;
            let preload_time;
            if (right_index!==undefined && left_index!==undefined){
                if (self.preview_time-left_time < right_time-self.preview_time){
                    preload_time = left_time;
                    index = left_index;
                } else {
                    preload_time = right_time;
                    index = right_index;
                }
            } else if (right_index===undefined) {
                preload_time = left_time;
                index = left_index;
            } else {
                preload_time = right_time;
                index = right_index;
            }
            return preload(self.range_data[index].s).then(function(burl){
                let autoload_index=self.getRangeWithTimeIndex(preload_time);
                if (autoload_index!==undefined){
                    self.range_data[autoload_index].p = true;
//console.log(''+autoload_index+' - '+new Date(preload_time).toISOString());
                }
                return preload_preview();
            }, function(error){
                let autoload_index=self.getRangeWithTimeIndex(preload_time);
                if (autoload_index!==undefined)
                    self.range_data[autoload_index].p = true;
                return preload_preview();
            });
        }
        this.preview_preload_timer = setTimeout(preload_preview,0);
    }
    addSpace(time, duration){
//if (time+Math.abs(duration) > new Date().getTime()) debugger;
        let self = this;
        if (!duration) return;
        let TIMEEND = time+Math.abs(duration);
        function RANGEEND(index){return !self.range_times || self.range_times.length<=index ? 0 : self.range_times[index]+Math.abs(self.range_durations[index]);}
        for (let i=this.range_times.length-1;i>=0;i--){
            if (this.range_times[i]>=TIMEEND) continue;
            if (RANGEEND(i)<time) break;
            let sgn = this.range_durations[i] < 0 ? -1 : 1;
            // If the new block completely includes this one, then kill it
            if (time<=this.range_times[i] && RANGEEND(i)<=TIMEEND){
                this.range_times.splice(i, 1);
                this.range_durations.splice(i, 1);
                this.range_expires.splice(i, 1);
                if (this.range_data) this.range_data.splice(i, 1);
                continue;
            }
            // If this is a block with data, and the new block somehow touches it, then we kill it
            if (this.range_data && this.range_data[i].s!==this.default_data && (this.range_times[i]>time && time<RANGEEND(i) || this.range_times[i]>TIMEEND && TIMEEND<RANGEEND(i))){
                this.range_times.splice(i, 1);
                this.range_durations.splice(i, 1);
                this.range_expires.splice(i, 1);
                if (this.range_data) this.range_data.splice(i, 1);
                continue;
            }
            // If the new block is completely inside this one, then cut it in half with the empty space inside
            if (this.range_times[i]<time && TIMEEND<RANGEEND(i)){
                this.range_times.splice(i+1, 0, TIMEEND);
                this.range_durations.splice(i+1, 0, (RANGEEND(i) - TIMEEND) * sgn);
                this.range_expires.splice(i+1, 0, Date.now());
                if (this.range_data) this.range_data.splice(i+1, 0, {s:''});
                this.range_durations[i] = (time - this.range_times[i]) * sgn;
                continue;
            }
            // If the current block contains the start time of a new block, then we shorten it
            if (this.range_times[i]<time && time<=RANGEEND(i)){
                this.range_durations[i] = (time - this.range_times[i]) * sgn;
                continue;
            }
            // If the end time of the new block falls into the current block, then we cut it in front
            if (this.range_times[i]<TIMEEND && TIMEEND<RANGEEND(i)){
                this.range_durations[i] = (Math.abs(this.range_durations[i]) - (TIMEEND-this.range_times[i]))*sgn;
                this.range_times[i] = TIMEEND;
                continue;
            }
        }
        for (let i=this.range_times.length-1;i>=0;i--)
            if (RANGEEND(i)<=time) return i+1;
        return 0;
    }
    checkNoEmptySpace(from, to){
        if (this.isEmpty()) return;
        let v = from;
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_times[i]+Math.abs(this.range_durations[i])<from) continue;
            if (!(this.range_times[i]<=v && v<this.range_times[i]+Math.abs(this.range_durations[i])))
                return false;
            v = this.range_times[i]+Math.abs(this.range_durations[i]);
            if (v>=to) return true;
        }
        return false;
    }
    // Checking if the specified time is already in full
    checkIncluded(time, duration){
        if (this.isEmpty()) return;
        if (isNaN(duration) || duration<0) duration=0;
        let v = time;
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_times[i]+Math.abs(this.range_durations[i])<time) continue;
            if (this.range_durations[i]<0 || !(this.range_times[i]<=v && v<this.range_times[i]+Math.abs(this.range_durations[i])))
                return false;
            v = this.range_times[i]+this.range_durations[i];
            if (v>=time+duration) return true;
        }
        return false;
/*
        let fti,lti;
        for (let i=0;i<this.range_times.length;i++){
            if (this.range_times[i]+Math.abs(this.range_durations[i])<time) continue;
            if (this.range_durations[i]<0) {
                if (fti!==undefined) break;
                continue;
            }
            if (fti===undefined) {fti = lti = i;continue}
            if (this.range_times[i-1]+this.range_durations[i-1]!=this.range_times[i]+this.range_durations[i])
                break;
            lti = i;
        }
        if (fti===undefined) return false;
        if (this.range_times[fti]<=time && (time+duration<=this.range_times[lti]+this.range_durations[lti]))
            return true;
        return false;
*/
    }
    // Delete all blocks that are completely inside the specified range
    removeIncluded(time, duration){
        for (let i=this.range_times.length-1;i>=0;i--){
            if (this.range_times[i] > time+Math.abs(duration)) continue;
            if (this.range_times[i]+Math.abs(this.range_durations[i]) < time) break;
            if (time <= this.range_times[i] && this.range_times[i]+Math.abs(this.range_durations[i]) <= time+Math.abs(duration)){
                this.range_times.splice(i, 1);
                this.range_durations.splice(i, 1);
                this.range_expires.splice(i, 1);
                if (this.range_data) this.range_data.splice(i, 1);
            }
        }
    }
    addToRange(time, duration, data){
        if (!duration) return;
        if (this.default_data===undefined) data = undefined;
        else if (data===undefined) data = this.default_data;
        data = {s:data};
        let self = this;
        function RANGEEND(index){return !self.range_times || self.range_times.length<=index ? 0 : self.range_times[index]+Math.abs(self.range_durations[index]);}

        let block_before;
        if (this.range_data && duration>0){
            if (this.checkIncluded(time, duration)) return;
            this.removeIncluded(time, duration);
            let left_block = this.getIndexFromTime(time);
            if (left_block!==undefined){
                if (this.range_durations[left_block]<0 || !this.range_data || this.range_data[left_block]===this.default_data){
                    this.range_times.splice(left_block+1, 0, time + duration);
                    this.range_durations.splice(left_block+1, 0, - this.range_times[left_block] - Math.abs(this.range_durations[left_block]) + time + duration);
                    this.range_expires.splice(left_block+1, 0, Date.now());
                    if (this.range_data) this.range_data.splice(left_block+1, 0, {s:this.default_data});
                    this.range_durations[left_block] = this.range_times[left_block] - time;
                    if (this.range_durations[left_block]<=0){
                        this.range_times.splice(left_block, 1);
                        this.range_durations.splice(left_block, 1);
                        this.range_expires.splice(left_block, 1);
                        if (this.range_data) this.range_data.splice(left_block, 1);
                    }
                } else {
                    data.o = (data.o||0) + this.range_times[left_block]+this.range_durations[left_block] - time;
                    duration = time + duration - this.range_times[left_block]-this.range_durations[left_block];
                    time = this.range_times[left_block]+this.range_durations[left_block];
                }
            }
            let right_block = this.getIndexFromTime(time+duration);
            if (right_block!==undefined){
                if (this.range_durations[right_block]<0 || !this.range_data || this.range_data[right_block]===this.default_data){
                    this.range_durations[right_block] = (this.range_times[right_block]+Math.abs(this.range_durations[right_block]) - time-duration) * (this.range_durations[right_block]>0?1:-1);
                    this.range_times[right_block] = time+duration;
                } else {
                    this.range_data[right_block].o = (this.range_data[right_block].o||0) + time+duration - this.range_times[right_block];
                    this.range_durations[right_block] = parseInt((this.range_times[right_block]+this.range_durations[right_block] - time-duration)*1000)/1000;
                    this.range_times[right_block] = time+duration;
                }
                block_before = right_block;
            } else {
                for (block_before=this.range_times.length-1;block_before>=0;block_before--)
                    if (this.range_times[block_before]<=time)
                        break;
                block_before++;
            }
        } else
            block_before= this.addSpace(time,duration);

        this.range_times.splice(block_before, 0, time);
        this.range_durations.splice(block_before, 0, duration);
        this.range_expires.splice(block_before, 0, Date.now());
        if (this.range_data) this.range_data.splice(block_before, 0, data);

        if (this.min_space_time && block_before){
            let t = this.range_times[block_before+1]-time-Math.abs(duration);
            if (this.range_durations.length>block_before+1 && t>0 && t<this.min_space_time)
                this.range_durations[block_before] = Math.sign(this.range_durations[block_before])*parseInt(this.range_times[block_before+1]*1000 - time*1000)/1000;
            let t2 = time-this.range_times[block_before-1]-Math.abs(this.range_durations[block_before-1]);
            if (block_before>1 && t2>0 && t2<this.min_space_time)
                this.range_durations[block_before-1] = Math.sign(this.range_durations[block_before-1])*parseInt(time*1000 - this.range_times[block_before-1]*1000)/1000;
        }
        if (this.min_space_time) for (let i=0;i<this.range_times.length;i++)
            if (this.range_data && !this.range_data[i].s && (/*parseInt(this.range_durations[i]*1000)/1000!=this.range_durations[i] ||*/ Math.abs(this.range_durations[i])<2000)) debugger;

        return block_before;
    }
    mergeIdentical(){
        function RANGEEND(index){return !self.range_times || self.range_times.length<=index ? 0 : self.range_times[index]+Math.abs(self.range_durations[index]);}
        for (let i=this.range_times.length-2;i>=0; i--){
            if ( (this.range_data && (this.range_data[i].s!==this.default_data || this.range_data[i+1].s!==this.default_data)) || (this.range_durations[i]>=0 && this.range_durations[i+1]<0)
                || (this.range_durations[i]<0 && this.range_durations[i+1]>=0)
                || RANGEEND(i)<this.range_times[i+1]) continue;
            this.range_durations[i] += this.range_durations[i+1];
            this.range_times.splice(i+1, 1);
            this.range_durations.splice(i+1, 1);
            this.range_expires.splice(i+1,1);
            if (this.range_data) this.range_data.splice(i+1, 1);
            if (block_before==i+1) block_before--;
        }
    }
}

class CKVideoAsync extends CKVideoSet{
    get VIDEO_LIMIT(){return this.options.video_limit || 1000;};
    constructor() {
        super();
        let self = this;
        this.base_url = undefined;
        this.records_cache = new CTimeRange('');
        this.mean_duration = 60000;
        this.max_buffer_duration = 10*60*1000;
        this.options = this.getAttribute('options')===null ? {} : JSON.parse(this.getAttribute('options'));
        this.storage = new CStorage(this.redux);
        this.redux.subscribe('video_loaded',function(event){
            self.videoLoaded(event.detail.event_param.data.time,event.detail.event_param.data.src,event.detail.event_param.data.msec,event.detail.event_param.data.off);
        });
        this.redux.subscribe('poster_loaded',function(event){
            self.posterLoaded(event.detail.event_param.data.time,event.detail.event_param.data.src,event.detail.event_param.data.msec);
        });
    }
    onCacheUpdated(){
        this.innerHTML = this.innerHTML==''?' ':'';
    }
    invalidateCache(){
        this.records_cache.invalidate();
        this.no_data_before=undefined;
        this.no_data_from=undefined;
    }
    invalidate(){
        this.invalidateCache();
        if (this.storage) this.storage.invalidate();
        return super.invalidate();
    }
    rangeRequest(from, to, interval){
        return {times:this.records_cache.range_times,durations:this.records_cache.range_durations};
    }
    getUrl(index){
        if (typeof this.decompressUrl !== 'function') return this.urls[index];
        return this.decompressUrl(this.urls[index]);
    }
    checkDataExist(time_from, time_to){
        return false;
    }
    getLastTime(){
        if (!this.records_cache.range_durations.length) return;
        return this.records_cache.range_times[this.records_cache.range_times.length-1] + Math.abs(this.records_cache.range_durations[this.records_cache.range_durations.length-1]);
    }
    sendRangeUpdate(times,durations){
        this.redux.post(this,'time_line_update',{times:times,durations:durations});
    }
    getRanges(from, to, interval){
        return {times:[],durations:[]};
    }
    compressUrl(url){
        return url;
    }
    decompressUrl(url){
        return url;
    }
    disconnectedCallback(){
        this.invalidateCache();
        super.disconnectedCallback();
    }
}
class CVxgStorage extends CStorage{
  get NOLOAD_DURATION(){return this.parent.options.noload_duration ? this.parent.options.noload_duration*1000 : 2000;};
  get POSTERS_LIMIT(){return this.parent.options.posters_limit ? this.parent.options.posters_limit : 100;};
  get VIDEO_LIMIT(){return this.parent.options.video_limit ? this.parent.options.video_limit : 100;};
  constructor(camera, redux, parent){
    super(redux);
    this.camera = camera;
    this.storage_timeline = new CTimeRange();
    this.parent = parent;
    this.events = {};
  }
  invalidate(){
    if (this.poster_promise1) this.poster_promise1.abort_controller.abort();
    if (this.poster_promise2) this.poster_promise2.abort_controller.abort();
    if (this.video_promise1) this.video_promise1.abort_controller.abort();
    if (this.video_promise2) this.video_promise2.abort_controller.abort();
    this.video_req_time = undefined;
    this.camera = undefined;
    this.storage_timeline.invalidate();
    super.invalidate();
  }
  addEmptyRange(time,duration){
    this.sendVideoLoaded(this.records_cache.addToRange(time, duration, ''));
  }
  getMicroDate(v){
    v = v.split('.');
    return (new Date(v[0]+'Z')).getTime() + (v[1] ? parseFloat('.'+v[1])*1000 : 0);
  }
  videoLoader(){
    if (!this.camera) return new Promise((resolve) => resolve());
    let self = this;
    if (this.video_promise1 || this.video_req_time===undefined) return;
    let req_time = this.video_req_time;
    this.video_req_time = undefined;
    if (!this.only_one && this.records_cache.checkData(req_time)!==undefined) return;

    if (!self.recordTimeMap) {
      self.recordTimeMap = new CTimeMap();
    }
    const foundRange = self.recordTimeMap.getTimeRange(req_time);
    if (foundRange) {
      return;
    }

    if (!this.only_one) {
      this.video_promise1 = this.camera.getStorageRecords(req_time,true,self.VIDEO_LIMIT).catch(() => null);
      if (req_time <= Date.now() - 1000)
        this.video_promise2 = this.camera.getStorageRecords(req_time,false,self.VIDEO_LIMIT).catch(() => null);
      else
        this.video_promise2 = new Promise((resolve) => resolve({ objects: [] }));
    } else {
      this.video_promise1 = new Promise((resolve) => resolve(false));
      if (req_time <= Date.now() - 1000)
        this.video_promise2 = this.camera.getStorageRecords(req_time,false,1).catch(() => null);
      else
        this.video_promise2 = new Promise((resolve) => resolve({ objects: [] }));
    }

    this.only_one = undefined;
    let prev_camera_id = this.camera.id;
    this.redux.send(this,'set_state',{value:'getrecords'});
    let request_time = Date.now();
    return new Promise((resolve) => setTimeout(resolve, 0)).then(function(){
      return Promise.all([self.video_promise1,self.video_promise2]).then(function(r){
        self.redux.send(self,'clear_state',{value:'getrecords'});
        self.video_promise1 = undefined;
        self.video_promise2 = undefined;
        if (!self.camera || prev_camera_id !== self.camera.id) return self.videoLoader();

        if (r[0] === null || r[1] === null) {
          console.error('Fail to get video list from storage');
          return self.videoLoader();
        }
        let no_data_to;
        if (!self.only_one && !r[1].objects.length) no_data_to = request_time;

        if (r[1] && r[1].objects) {
          const objects = r[1].objects;
          const endTime = objects.length ? new Date(objects[objects.length - 1].end + 'Z').getTime() : Date.now() - 10000;
          self.recordTimeMap.addTimeRange(req_time, endTime);
        }

        if (r[0] !== false) {
          const objects = r[0].objects;
          const startTime = objects.length ? new Date(objects[objects.length - 1].start + 'Z').getTime() : req_time - self.VIDEO_LIMIT * 1000;
          const endTime = objects.length ? new Date(objects[0].end + 'Z').getTime() : Math.min(req_time, Date.now() - 10000);
          self.recordTimeMap.addTimeRange(startTime, endTime);

          if (!objects.length && self.records_cache.checkData(0)===undefined)
            self.addEmptyRange(0, -req_time);

          while (objects.length) {
            r[1].objects.unshift(objects.pop());
          }
        }

        let m=0; let c=0; let prev;
        r[1].objects.forEach((obj) => {
          let st = self.getMicroDate(obj['start']);
          let et = self.getMicroDate(obj['end']);
          if (isNaN(et) || isNaN(st)){
            console.warn('Invalid time value for video  block');
            return;
          }
          if (prev===undefined && st-req_time>=self.NOLOAD_DURATION && self.records_cache.checkData(req_time)===undefined)
            self.addEmptyRange(req_time, (req_time*1000-st*1000)/1000);
          if (prev!==undefined && st-prev>=self.NOLOAD_DURATION && self.records_cache.checkData(prev)===undefined)
            self.addEmptyRange(prev, (prev*1000 - st*1000)/1000);
//                    if (self.records_cache.checkData(st)===undefined)
          self.sendVideoLoaded(self.records_cache.addToRange(st, (et*1000-st*1000)/1000, obj['url']));
          if (et-st>0) {m+=et-st;c++;}
          prev = et;
        });
        if (no_data_to)
          self.addEmptyRange(prev, (prev*1000 - no_data_to*1000)/1000);

        if (c) self.mean_duration = parseInt(m/c);
        self.records_cache.mergeIdentical();
        
        self.parent.setTimePromise(req_time);
        return self.videoLoader();
      });
    });
  }
  tryGetVideo(utctime, onlyone){
    this.video_req_time = utctime;
    if (onlyone) this.only_one = true;
    this.videoLoader();
  }
  posterLoader(){
    return;
    if (!this.camera) return;
    let self = this;
    if (this.poster_promise1 || this.poster_req_time===undefined) return;
    let req_time = this.poster_req_time;
    this.poster_req_time = undefined;
    if (this.posters_cache.checkData(req_time)!==undefined) return;
    if (req_time > Date.now() || req_time <= Date.now() - 600 * 1000) return;

    if (this.last_poster_req_time && Math.abs(this.last_poster_req_time - req_time) <= 30000) {
      return;
    }

    this.last_poster_req_time = req_time;

    if (!self.posterTimeMap) {
      self.posterTimeMap = new CTimeMap();
    }
    const foundRange = self.posterTimeMap.getTimeRange(req_time);

    if (!foundRange) {
      this.poster_promise1 = this.camera.getStorageThumbnails(req_time,true,this.POSTERS_LIMIT).catch(() => null);
      // } else if (foundRange.start > req_time - 30000) {
      //   this.poster_promise1 = this.camera.getStorageThumbnails(foundRange.start,true,this.POSTERS_LIMIT).catch(() => null);
    } else {
      this.poster_promise1 = new Promise((resolve) => resolve(false));
    }
    if (foundRange) {
      this.poster_promise2 = new Promise((resolve) => resolve({ objects: [] }));
    } else {
      this.poster_promise2 = this.camera.getStorageThumbnails(req_time,false,this.POSTERS_LIMIT).catch(() => null);
    }

    let prev_camera_id = this.camera.id;

    this.redux.send(this, 'set_state', { value:'getpreviews' });
    return Promise.all([this.poster_promise1, this.poster_promise2]).then(function(r){
      self.redux.send(self, 'clear_state', { value:'getpreviews' });
      self.poster_promise1 = undefined;
      self.poster_promise2 = undefined;
      if (!self.camera || prev_camera_id !== self.camera.id) return self.posterLoader();

      if (r[0] === null || r[1] === null) {
        console.error('Fail to get posters list from storage');
        return self.posterLoader();
      }
      if ((r[0] !== false ? r[0].objects.length : 0) + (r[1] !== false ? r[1].objects.length : 0) < 1)
        return self.posterLoader();

      let flen = r && r[1] && r[1].objects ? r[1].objects.length : 0;
      if (req_time < Date.now() - 10000) {
        const objects = r[1].objects;
        const endTime = flen ? new Date(objects[objects.length - 1].time + 'Z').getTime() : Date.now() - 10000;
        self.posterTimeMap.addTimeRange(req_time, endTime);
      }

      if (r[0] !== false) {
        const objects = r[0].objects;
        const startTime = objects.length ? new Date(objects[objects.length - 1].time + 'Z').getTime() : req_time - self.POSTERS_LIMIT * 1000;
        const endTime = objects.length ? new Date(objects[0].time + 'Z').getTime() : Math.min(req_time, Date.now() - 10000);
        self.posterTimeMap.addTimeRange(startTime, endTime);

        if (!objects.length && self.posters_cache.checkData(0)===undefined){
          // let d = self.posters_cache.getNearWithDataIndex(0,false);
          let rt = req_time;
          if (r[1].objects.length) {
            rt = (new Date(r[1].objects[0]['time']+'Z')).getTime();
            self.sendPosterLoaded(self.posters_cache.addToRange(0, rt, r[1].objects[0]['url']));
          }
        }

        while (objects.length) {
          r[1].objects.unshift(objects.pop());
        }
      }

      const objects = r[1].objects;
      for (let i=0 ; i < objects.length-1 ; i++) {
        let t = (new Date(objects[i]['time']+'Z')).getTime();
        let t2 = (new Date(objects[i+1]['time']+'Z')).getTime();
        let j = self.posters_cache.getIndexFromTime(t);
        // last image has duration 1 ms
        if (j===undefined || self.posters_cache.range_durations[j]<2)
          self.sendPosterLoaded(self.posters_cache.addToRange(t, t2-t, objects[i]['url']));
      }
      if (flen!==self.POSTERS_LIMIT){
        let e = Date.now()-1000;
        let lt = self.posters_cache.getLastTime();
        self.sendPosterLoaded(self.posters_cache.addToRange(lt, lt-e, ''));
      }
      self.posters_cache.mergeIdentical();
      self.parent.updateCache();
      return self.posterLoader();
    });
  }
  tryGetPoster(utctime){
    this.poster_req_time = utctime;
    this.posterLoader();
  }
}

class CKVgxVideo extends CKVideoAsync{
  get TIMELINE_LIMIT(){return this.options.timeline_limit || 1000;};
  get TIMELINE_UPDATE_PERIOD(){return this.options.timeline_update_period ? this.options.timeline_update_period * 1000 : 5000;};
  get EVENTS_LIMIT(){return this.options.events_limit || 100;};
  get EVENTS_UPDATE_PERIOD(){return this.options.events_update_period ? this.options.events_update_period * 1000 : 10000;};
  constructor() {
    super();
    this.options = this.getAttribute('options')===null ? {} : JSON.parse(this.getAttribute('options'));
    let self = this;
  }
  connectedCallback() {
    super.connectedCallback();
    let self = this;
    this.addEventListener("error", function(e){
      if (e && e.detail && e.detail.src && e.detail.src.error && e.detail.src.error.code===4)
        self.invalidate();
    });

  }
  loadLiveImage(){
    return;
    let self = this;
    if (!this.camera || this.load_live_image_timer) return;
    let prev_camera_id = this.camera.id;
    this.load_live_image_timer = setTimeout(function(){
      self.camera.get_v4_live_image().then(function(data){
        self.load_live_image_timer = undefined;
        if (!self.camera || prev_camera_id !== self.camera.id) return;
        self.redux.post(self,'poster_loaded',{data:{time:Date.now(),msec:1,src:data.url},
          debug:''+(new Date(parseInt(Date.now())).toISOString().replace('T',' '))});
      }, function(){
        console.error('Fail to get live image');
        self.load_live_image_timer = undefined;
      });
    },0);
  }
  get src(){
    return this.camera.token;
  }
  set src(token){
    let self = this;
    try{this.camera = new CVxgCamera(token);} catch(e){
      //throw e;
      //console.warn('Invalid token');
    }
    this.invalidate();

    if (!self.camera) return;
    let t = self.currentUtcTime || Date.now();
    if (t >= Date.now() - 10 * 60 * 1000) {
      self.loadLiveImage();
    }
    self.setTimePromise(t);
    self.updateRange(t - 1000*60*60*24, t + 1000*60*60*24);
  }
  invalidate(){
    let self = this;
    clearTimeout(this.load_live_image_timer);
    clearTimeout(this.delay_range_timer);
    clearTimeout(this.update_range_timer);
    clearTimeout(this.update_events_timer);
    this.storage.invalidate();
    this.invalidatePlayers(true);
    super.invalidate()
    if (self.camera){
      self.storage = new CVxgStorage(self.camera, self.redux, self);
      self.storage.records_cache.min_space_time = self.NOLOAD_DURATION;
    }
  }
  restart(){
    console.warn('Restarting..');
    this.pause().catch(function(){});
    let token = this.camera&&this.camera.token ? this.camera.token : '';
    this.invalidate();
    this.src = token;
  }
  rangeRequest(from, to, interval){
//console.log('rangeRequest: '+(new Date(from).toISOString())+' '+(new Date(to).toISOString()));
    if (!this.storage.storage_timeline || !this.storage.storage_timeline.checkActually(from, to>Date.now()-5000?Date.now()-5000:to)){
      if (!this.update_range_timer || this.range_from != from || this.range_to != to){
        let d = parseInt(to - from);
        this.updateRange(from-d, to+d);
      }
    } else if (this.storage.storage_timeline.checkFilled(from, to))
      clearTimeout(this.update_range_timer);

    if (!this.storage.storage_timeline) return {times:[],durations:[]};
    return {times:this.storage.storage_timeline.range_times,durations:this.storage.storage_timeline.range_durations};
  }
  updateRange(from, to, not_send_update){
//console.log('updateRange: '+(new Date(from).toISOString())+' '+(new Date(to).toISOString()));
    if (isNaN(from) || isNaN(to) || !this.storage.storage_timeline) return;

    let self = this;
    this.range_from = from;
    this.range_to = to;
    if (this.update_range_timer) return;
    clearTimeout(this.delay_range_timer);

    function upr(){
      self.delay_range_timer = undefined;
      if (self.archive_right_time !==undefined && self.range_to>self.archive_left_time) self.range_to=self.archive_right_time;
      if (self.archive_left_time !==undefined && self.range_from<self.archive_right_time) self.range_from=self.archive_left_time;
      let from_time = self.range_from;
      let to_time = self.range_to;
      if (!from_time || !to_time || self.storage.storage_timeline.checkFilled(self.range_from, self.range_to) || from_time>=to_time - 1000) {
        self.range_from = undefined; self.range_to=undefined;
        self.update_range_timer = undefined;
        return;
      }

      self.onGetTimeline(from_time, to_time, self.TIMELINE_LIMIT, not_send_update).then(function(do_not_send_update){
        self.update_range_timer = undefined;
        if (!self.storage.storage_timeline.checkFilled(self.range_from, self.range_to)){
          clearTimeout(self.delay_range_timer);
          self.delay_range_timer = setTimeout(upr, self.TIMELINE_UPDATE_PERIOD);
        }else
          upr();
      },function(){
        self.update_range_timer = undefined;
      });
    }
    this.update_range_timer = setTimeout(upr,0);

    function loadEvents(){
      if (self.archive_right_time !==undefined && self.range_to>self.archive_left_time) self.range_to=self.archive_right_time;
      if (self.archive_left_time !==undefined && self.range_from<self.archive_right_time) self.range_from=self.archive_left_time;
      let from_time = self.range_from;
      let to_time = self.range_to;
      if (!from_time || !to_time || from_time >= to_time - 1000) {
        self.range_from = undefined; self.range_to=undefined;
        self.update_events_timer = undefined;
        return;
      }

      self.onGetEvents(from_time, to_time, self.EVENTS_LIMIT).then(function(){
        self.update_events_timer = undefined;
      },function(){
        self.update_events_timer = undefined;
      });
    }
    this.update_events_timer = setTimeout(loadEvents,0);
  }
  onGetTimeline(start_time, end_time, limit, not_send_update){
//console.log('onGetTimeline: '+(new Date(start_time).toISOString())+' '+(new Date(end_time).toISOString()));
    let self = this;
    if (!this.camera)
      return new Promise(function(resolve, reject){setTimeout(function(){resolve();},0);}).then(function(){
        self.redux.post(self,'get_storage_timeline',{start_time:start_time,end_time:end_time,limit:limit,debug:' no camera'});
        self.setState('invalidtoken');
        throw 'invalidtoken';
      });

    if (!self.timelineTimeMap) {
      self.timelineTimeMap = new CTimeMap();
    }

    if (end_time > Date.now()) {
      end_time = Date.now();
    }
    const foundRange = self.timelineTimeMap.getTimeRange(start_time);
    if (foundRange) {
      start_time = foundRange.end + 1;
    }

    if (start_time >= end_time - 10000) {
      return new Promise((resolve) => resolve({ objects: [] }));
    }

    this.setState('timelining');
    let prev_camera_id = this.camera.id;
    return this.camera.getStorageTimeline(start_time, end_time, limit).then(function(r){
      if (self.camera) self.redux.post(self,'get_storage_timeline',{start_time:start_time,end_time:end_time,limit:limit,result:r.objects,debug:''+r.objects.length+' items from time '+(new Date(parseInt(start_time)).toISOString().replace('T',' '))+' to time '+(new Date(parseInt(end_time)).toISOString().replace('T',' '))});
      self.clearState('timelining');
      if (!self.camera || prev_camera_id !== self.camera.id) return;
      let lasttime;
      let durations_sum = self.storage.storage_timeline.getDurationSum();

      if (r && r.objects && r.objects[0] && r.objects[0][3]) {
        const objects = r.objects[0][3];
        let maxTime = objects.length ? start_time : Math.min(end_time, Date.now() - 3000);
        objects.forEach(([time, duration]) => {
          if (!time.endsWith('Z')) {
            time += 'Z';
          }
          const timestamp = new Date(time).getTime() + duration * 1000;
          maxTime = Math.max(maxTime, timestamp);
        });
        self.timelineTimeMap.addTimeRange(start_time, maxTime);
      }

      if (r && r.objects && r.objects[0] && r.objects[0][3] && r.objects[0][3].length) for (let i=0; i< r.objects[0][3].length; i++){
        let st = (new Date(r.objects[0][3][i][0]+'Z')).getTime();
        if (i==0 && st>start_time){
          self.storage.storage_timeline.addToRange(start_time, start_time - st);
//                    self.storage.records_cache.addToRange(lasttime, start_time - st);
        }
        let dur = parseInt(r.objects[0][3][i][1])*1000;
        if (lasttime!==undefined && st-lasttime>0){
          self.storage.storage_timeline.addToRange(lasttime, lasttime - st);
//                    self.storage.records_cache.addToRange(lasttime, lasttime - st);
        }
        self.storage.storage_timeline.addToRange(st, dur);
        lasttime = st + dur;
      } else
        lasttime = start_time;
      if (lasttime< (end_time<Date.now()?end_time:Date.now()))
        self.storage.storage_timeline.addToRange(lasttime, lasttime - (end_time<Date.now()?end_time:Date.now()));

      let ft = self.storage.storage_timeline.getFirstKnownTime(0, false);
      if (ft) self.redux.post(self,'min_time',{value:ft});
      if (!not_send_update) {
        self.sendRangeUpdate(self.storage.storage_timeline.range_times,self.storage.storage_timeline.range_durations);
        if (durations_sum != self.storage.storage_timeline.getDurationSum()){
          self.storage.records_cache.clearExpired();
          self.invalidateEmptyPlayers(start_time, end_time);
          self.updateCache();
        }
      }
      self.storage.storage_timeline.mergeIdentical();

      return not_send_update;
    },function(r){
      console.error('Fail to get timeline from storage');
      self.redux.post(self,'get_storage_timeline',{start_time:start_time,end_time:end_time,limit:limit,error:r,debug:' load fail from time '+(new Date(parseInt(start_time)).toISOString().replace('T',' '))+' to time '+(new Date(parseInt(end_time)).toISOString().replace('T',' '))});
      self.clearState('timelining');
    });
  }
  onGetEvents(start_time, end_time, limit, not_send_update){
    // console.log('onGetEvents: '+(new Date(start_time).toISOString())+' '+(new Date(end_time).toISOString()));
    let self = this;
    if (!this.camera)
      return new Promise(function(resolve, reject){setTimeout(function(){resolve();},0);}).then(function(){
        self.redux.post(self,'get_storage_events',{start_time:start_time,end_time:end_time,limit:limit,debug:' no camera'});
        self.setState('invalidtoken');
        throw 'invalidtoken';
      });

    if (!self.eventTimeMap) {
      self.eventTimeMap = new CTimeMap();
    }

    if (end_time > Date.now()) {
      end_time = Date.now();
    }
    const foundRange = self.eventTimeMap.getTimeRange(start_time);
    if (foundRange) {
      start_time = foundRange.end + 1;
    }

    if (start_time >= end_time - 20000) {
      return new Promise((resolve) => resolve({ objects: [] }));
    }

    this.setState('loadingevents');
    let prev_camera_id = this.camera.id;
    return this.camera.getStorageEvents(start_time, end_time, limit).then(function(r){
      if (self.camera) self.redux.post(self,'get_storage_events',{start_time:start_time,end_time:end_time,limit:limit,result:r.objects,debug:''+r.objects.length+' items from time '+(new Date(parseInt(start_time)).toISOString().replace('T',' '))+' to time '+(new Date(parseInt(end_time)).toISOString().replace('T',' '))});
      self.clearState('loadingevents');
      if (!self.camera || prev_camera_id !== self.camera.id) return;

      if (!self.events) {
        self.events = {};
      }
      let maxTime = r.objects.length ? start_time : Math.min(end_time, Date.now() - 5000);
      r.objects.forEach((e) => {
        let time = e.time;
        if (!time.endsWith('Z')) {
          time += 'Z';
        }
        e.timestamp = new Date(time).getTime();
        maxTime = Math.max(maxTime, e.timestamp);
        self.events[e.time] = e;
      });

      self.eventTimeMap.addTimeRange(start_time, maxTime);
      return r;
    },function(r){
      console.error('Fail to get events from storage');
      self.redux.post(self,'get_storage_events',{start_time:start_time,end_time:end_time,limit:limit,error:r,debug:' load fail from time '+(new Date(parseInt(start_time)).toISOString().replace('T',' '))+' to time '+(new Date(parseInt(end_time)).toISOString().replace('T',' '))});
      self.clearState('loadingevents');
    });
  }
  hasAccess(){
    return true;
  }
  disconnectedCallback(){
    if (this.camera?.destroy) this.camera.destroy();
    this.camera = undefined;
    super.disconnectedCallback();
  }

  getFirstStorageData() {
    if (!this.camera) {
      return Promise.reject();
    }
    return this.camera.getStorageData({
      limit: 1,
      order_by: 'time',
    });
  }
}

window.customElements.define('k-video-vxg', CKVgxVideo);
class CSdVxgStorage extends CVxgStorage{
    constructor(camera, redux, parent){
        super(camera, redux);
        this.sdcard_timeline = new CTimeRange();
        this.parent = parent;
    }
//    addEmptyRange(time,duration){
//    }
    invalidate(){
        this.sdcard_timeline.invalidate();
        super.invalidate();
    }
    get SYNC_DURATION(){return this.parent.options.sync_duration ? this.parent.options.sync_duration*1000 : 15000;};
    get NOLOAD_DURATION(){return this.parent.options.noload_duration ? this.parent.options.noload_duration*1000 : 2000;};
    get USE_CANCEL(){return this.parent.options.use_sync_cancel!==undefined ? (!!this.parent.options.use_sync_cancel) : false;};

    toMictoTime(time){
        let t = parseInt(time/1000)*1000;
        let r = (new Date(time)).toISOString().substr(0,19);
        r += ((time-t)/1000).toFixed(6).substr(1);
        return r;
    }
    addMicro(time, add_mks){
        let v = time.split('.');
        let mks = (v[1] ? parseFloat('.'+v[1]) : 0.0) + add_mks/1000000;
        let add_sec = mks>=1 ? parseInt(mks) : (mks<0 ? parseInt(mks)-1 : 0);
        if (mks<0) mks+= - parseInt(mks) + 1.0;
        if (mks>=1) mks-=parseInt(mks);
        let t = new Date(v[0]+'Z').getTime() + add_sec*1000;
        let ret = new Date(t).toISOString().substr(0,19)+mks.toFixed(6).substr(1);
        return ret;
    }
    getStorageMemorycardSynchronize(start_time, end_time, retry_count){
        if (!this.camera) return;
        this.redux.post(this,'syncstart',{data:{start_time:start_time,end_time:end_time},
                    debug:''+this.toMictoTime(start_time)+' - '+this.toMictoTime(end_time) });

        let self=this;
        if (!retry_count) retry_count=100;

        let st = typeof start_time === 'string' ? start_time : this.toMictoTime(start_time);
        let et = typeof end_time === 'string' ? end_time : this.toMictoTime(end_time);
        // TODO: Cloud believes that the end time is "included" in the required interval, to fix it, we reduce the time by 1 microsecond
        et = this.addMicro(et,-1);
        let prev_camera_id = this.camera.id;

        return this.camera.post_v2_storage_memorycard_synchronize(this.camera.id,{start:st,end:et}).then(function(trd){
//console.log(trd);
            if (!self.camera || prev_camera_id !== self.camera.id) return new Promise(function(resolve, reject){resolve();});

            if (trd.status!=='pending')
                return trd;
            let check = function(rid, rc){
                if (!self.camera || prev_camera_id !== self.camera.id) return new Promise(function(resolve, reject){reject();});
                if (self.USE_CANCEL && (!self.parent.isPlaying() || !self.parent.isCameraOnline())){
                    return self.camera.post_v2_storage_memorycard_synchronize_cancel(self.camera.id, rid).then(function(r){
                        return new Promise(function(resolve, reject){resolve();});
                    });
                }
//                if (!self.isCameraOnline()){
//                    throw 'not_connected';
//                }
                if (!rc)
                    return Promise.reject('synctimeout');
                return new Promise(function(resolve, reject){setTimeout(function(){resolve()},1000);}).then(function(){
                    return self.camera.get_v2_storage_memorycard_synchronize(self.camera.id, rid).then(function(r){
                        if (r.status!=='pending') return r;
                        return new Promise(function(resolve, reject){setTimeout(function(){resolve()},100);}).then(function(){
                            return check(rid,rc-1);
                        });
                    });
                });
            }
            return check(trd.id, retry_count);
        });
    }
    startSynchronize(){
        if (!this.parent.isPlaying()){
            this.sync_start_time = undefined;
            this.sync_end_time = undefined;
        }
        if (this.sync_promise || this.sync_start_time===undefined || this.sync_end_time===undefined || !this.parent.isPlaying()) return;

        let self = this;
        const start_time = this.sync_start_time;
        const end_time = this.sync_end_time;
        this.sync_start_time = undefined;
        this.sync_end_time = undefined;
        this.redux.send(this,'set_state',{value:'syncronizing'});
        this.redux.send(this,'clear_state',{value:'sync_timeout_error'});
        this.redux.send(this,'clear_state',{value:'sync_error'});
        this.redux.send(self,'clear_state',{value:'camera_side_error'});

        let prev_camera_id = this.camera.id;

        this.sync_promise = this.getStorageMemorycardSynchronize(start_time, end_time, 100).then(function(r){
            if (prev_camera_id !== self.camera.id) return;

            self.redux.send(self,'clear_state',{value:'syncronizing'});
            if (!r || r.status!=='done'){
                self.sync_promise = undefined;
                if (r){
                    if (r.error_code == 'camera_side_error')
                        self.redux.send(self,'set_state',{value:'camera_side_error'});
                    throw r.error_code;
                    return;
                }
                if (!r) throw 'cancel';
                throw 'syncerror';
                return;
            }
            self.redux.send(self,'clear_state',{value:'camera_side_error'});

            return self.camera.getOneStorageRecord(start_time+1,end_time-1,20, function(){return !self.parent.isPlaying()}).then(function(r){
                self.sync_promise = undefined;
                if (prev_camera_id !== self.camera.id) return;
                if (!r || !r.objects || !r.objects.length) {
                    self.startSynchronize();
                    return;
                }
                let st = self.getMicroDate(r.objects[0]['start']+'Z');
                let et = self.getMicroDate(r.objects[0]['end']+'Z');
                self.sendVideoLoaded(self.records_cache.addToRange(st, et-st, r.objects[0]['url']));
                if (self.sync_start_time == start_time && self.sync_end_time == end_time){
                    self.sync_start_time = undefined;
                    self.sync_end_time = undefined;
                }
                self.records_cache.mergeIdentical();
                self.parent.updateCache();
                self.startSynchronize();
            });
        }).catch(function(r){
            self.sync_promise = undefined;
            self.redux.send(self,'clear_state',{value:'syncronizing'});
            if (r=='synctimeout'){
                self.redux.send(self,'set_state',{value:'sync_timeout_error'});
            }
            if (r!='cancel'){
                console.error('Syncronize fail: '+r);
                self.redux.send(self,'set_state',{value:'sync_error'});
                self.sendVideoLoaded(self.records_cache.addToRange(start_time, end_time-start_time, '#invalid'));
                if (self.sync_start_time == start_time && self.sync_end_time == end_time){
                    self.sync_start_time = undefined;
                    self.sync_end_time = undefined;
                }
                self.records_cache.mergeIdentical();
                self.parent.updateCache();
                self.startSynchronize();
            }
        });
    }
    synchronize(start_time, end_time){
        this.sync_start_time = start_time;
        this.sync_end_time = end_time;
        this.startSynchronize();
    }
    getVideo(utctime){
        if (!this.parent.isPlaying()) return super.getVideo(utctime);
        let i = this.records_cache.getRangeWithTimeIndex(utctime);
        if (i===undefined || this.records_cache.range_durations[i]<0){

            if (i && this.records_cache.range_durations[i]> -this.NOLOAD_DURATION)
                return {time:parseInt(this.records_cache.range_times[i]),
                    msec:Math.sign(this.records_cache.range_durations[i])*parseInt(Math.abs(this.records_cache.range_durations[i])+this.records_cache.range_times[i]-parseInt(this.records_cache.range_times[i])),
                    src:this.records_cache.range_data[i].s,off:this.records_cache.range_data[i].o};
            let t,d;
            if (i!==undefined){
                t = this.records_cache.range_times[i];
                d = this.records_cache.range_durations[i];
            } else {
                i = this.records_cache.getSpaceWithTime(utctime);
                if (i){
                    t = i.time;
                    d = i.msec;
                }
            }

            const tr = this.sdcard_timeline.getRangeWithTime(utctime);
            if (t!==undefined && tr!==undefined && tr.msec>=0){
                let left_time = t > tr.time ? t : tr.time;
                let right_time = t + Math.abs(d);
                right_time = right_time > tr.time + tr.msec ? tr.time + tr.msec : right_time;
                if (utctime - left_time > this.SYNC_DURATION && right_time - utctime > this.SYNC_DURATION){
                    // Start syncronize from 1 seconds before
                    left_time = utctime -1000;
                    right_time = left_time + this.SYNC_DURATION;
                } else if (utctime - left_time <= this.SYNC_DURATION && right_time - utctime > this.SYNC_DURATION){
                    if (right_time - left_time - this.SYNC_DURATION >= this.NOLOAD_DURATION)
                        right_time = left_time + this.SYNC_DURATION;
                } else if (utctime - left_time > this.SYNC_DURATION && right_time - utctime <= this.SYNC_DURATION){
                    if (right_time - left_time - this.SYNC_DURATION >= this.NOLOAD_DURATION)
                        left_time = right_time - this.SYNC_DURATION;
                }

                if (right_time - left_time < this.NOLOAD_DURATION) return;
                this.synchronize(left_time, right_time);
                return;
            }
            i=undefined;
        }

        if (i===undefined){
            i = this.records_cache.getSpaceWithTime(utctime);
            this.tryGetVideo(utctime);
            if (i!==undefined) return {time:parseInt(i.time),
                msec:Math.sign(i.msec)*parseInt(Math.abs(i.msec)+i.time-parseInt(i.time)),
                src:'',off:0};
            return;
        }
        return {time:parseInt(this.records_cache.range_times[i]),
            msec:Math.sign(this.records_cache.range_durations[i])*parseInt(Math.abs(this.records_cache.range_durations[i])+this.records_cache.range_times[i]-parseInt(this.records_cache.range_times[i])),
            src:this.records_cache.range_data[i].s,off:this.records_cache.range_data[i].o};

    }
}

class CKVgxSdVideo extends CKVgxVideo{
    constructor() {
        super();
        this.check_times = [];
        this.visiblity = true;

/*
const handler = {
  get: function(obj, prop) {
      return prop in obj ? obj[prop] : undefined;
  },
  set: function(obj, prop, val) {
if (val===undefined) debugger;
      obj[prop] = val;
      return true;
  }
};
        this.durations2 = this.durations;
        this.durations = new Proxy(this.durations2, handler);
*/


    }
    get SYNC_DURATION(){return this.options.sync_duration ? this.options.sync_duration*1000 : 15000;};
    get NOLOAD_DURATION(){return this.options.noload_duration ? this.options.noload_duration*1000 : 2000;};
    get SD_TIMELINE_UPDATE_PERIOD(){return this.options.sd_timeline_update_period ? this.options.sd_timeline_update_period*1000 : 15000;};
    get CAMINFO_UPDATE_PERIOD(){return this.options.caminfo_update_period ? this.options.caminfo_update_period*1000 : 3000;};
    invalidate(){
        let self = this;
        this.sdcardmode = false;
        clearTimeout(this.sd_delay_timer);
        clearTimeout(this.sd_range_timer);
        super.invalidate();
        if (self.camera){
            self.storage = new CSdVxgStorage(self.camera, self.redux, self);
            self.storage.records_cache.min_space_time = self.NOLOAD_DURATION;
        }
    }
    isVisible(){
        return this.visiblity;
    }
    handleVisibilityChange(v){
        this.visiblity = v;
// console.log('-->'+v);
    }
    connectedCallback() {
        super.connectedCallback();
        var hidden, visibilityChange;
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
        let self = this;
        document.addEventListener(visibilityChange, function(){self.handleVisibilityChange(!document[hidden]);}, false);

        this.redux.subscribe('camera_connected',function(event){
            if (!event.detail.event_param.value){
                self.setState('notconnected');
                self.last_status='offline';
                self.sendRangeUpdate(self.storage.storage_timeline.range_times,self.storage.storage_timeline.range_durations);
                self.storage.sdcard_timeline.invalidate();
                self.timlineloaded = false;
            } else{
                self.clearState('notconnected');
                self.invalidate();
                self.updateCache();
            }
        });

    }
    disconnectedCallback(){
        this.camera =  undefined;
        this.invalidate();
        super.disconnectedCallback();
    }
    set src(token){
        let self = this;
        try {
            this.camera = new CVxgCamera(token);
        } catch(e) {
            this.camera = null;
            //throw e;
        }

        this.invalidate();
        if (!this.camera){
            this.setStatus('invalidtoken');
            console.warn('Invalid token');
            return;
        }
        this.camera.get_v2_cameras({preview:true},this.camera.id).then(function(r){
            self.sdcardmode = !(!r || !r['memorycard_recording']);
            if (self.sdcardmode && !camera.isFullAccess()){
                self.sdcardmode = false;
                console.error('SD VXG required full access!');
            }
//            self.invalidate().then(function(){
                self.sdcardmode = !(!r || !r['memorycard_recording']);
                if (!self.camera) return;
                let t = self.currentUtcTime||(new Date().getTime());
//                self.loadLiveImage();

                self.setTimePromise(t);
                self.updateRange(t - 1000*60*60*24, t + 1000*60*60*24, 1000);
                self.redux.post(self,'poster_loaded',{data:{time:Date.now(),msec:1,src:r.preview.url},
                    debug:''+(new Date(parseInt(Date.now())).toISOString().replace('T',' '))});
                self.sendRangeUpdate([],[]);
//                self.updateCache();
//            });
        });
    }
    checkDataExist(time_from, time_to){
        return this.storage.sdcard_timeline.checkRange(time_from, time_to);
    }
    rangeRequest(from, to, interval){
        if (!this.camera) return {times:[],durations:[]};
        if (!this.sdcardmode || !this.isCameraOnline()) return super.rangeRequest(from, to, interval);
  //      if (!this.storage.storage_timeline || !this.storage.storage_timeline.checkActually(from, to))
            this.updateRange(from, to, interval);
        if (!this.storage.sdcard_timeline) return {times:[],durations:[]};
        return {times:this.storage.sdcard_timeline.range_times,durations:this.storage.sdcard_timeline.range_durations};
    }
    updateRange(from, to, delay){
        if (!this.camera || isNaN(from) || isNaN(to)) return;
        if (!this.storage.storage_timeline || !this.storage.storage_timeline.checkNoEmptySpace(from,to))
            super.updateRange(from-60*60*1000, to+60*60*1000, delay, true);
        if (this.sdcardmode && (!this.storage.sdcard_timeline || !this.storage.sdcard_timeline.checkActually(from,to))){
            if (to-from<4*60*60*1000)
                from = to - 4*60*60*1000;
            this.updateSdTimeline(from, to);
        } else {
            this.sd_range_from = from;
            this.sd_range_to = to;
        }
    }
    updateSdTimeline(from,to){
        if (this.sd_range_from==from && this.sd_range_to==to && this.sd_delay_timer) return;
        let self = this;
        this.sd_range_from = from;
        this.sd_range_to = to;
        if (!this.camera || this.sd_range_timer) return;
        clearTimeout(this.sd_delay_timer);
        function upr(){
            let start = self.sd_range_from; let end = self.sd_range_to;
            self.sd_delay_timer=undefined;
            if (!start || !end || self.storage.sdcard_timeline && self.storage.sdcard_timeline.checkActually(start, end)){
                self.sd_range_from = undefined; self.sd_range_to = undefined;
                self.sd_range_timer = undefined;
                return;
            }
            self.redux.send(self,'clear_state',{value:'sd_timeline_error'});
            self.getSdTimeline(start,end).then(function(r){
                self.sd_range_timer = undefined;
                clearTimeout(self.sd_delay_timer);
                if (self.sd_range_from==start && self.sd_range_to==end)
                    self.sd_delay_timer = setTimeout(upr,self.SD_TIMELINE_UPDATE_PERIOD);
                else
                    upr();
            },function(r){
                console.error('Fail to get timeline from camera');
                clearTimeout(self.sd_delay_timer);
                self.sd_range_timer = undefined;
                self.sd_delay_timer = setTimeout(upr,self.SD_TIMELINE_UPDATE_PERIOD);
                self.redux.send(self,'set_state',{value:'sd_timeline_error'});
                self.setStatus('error');
            });
        }
        this.sd_range_timer = setTimeout(upr,0);
    }
    getSdTimeline(start_time, end_time){
        let self = this;
        if (!this.timlineloaded) this.setState('firsttimelining');

        this.setState('sdtimelining');
if (!self.camera) debugger;

        let prev_camera_id = this.camera.id;

        return self.camera.getStorageMemorycardTimeline(start_time, end_time).then(function(r){
            if (prev_camera_id !== self.camera.id) return Promise.resolve();
            self.clearState('firsttimelining');
            self.clearState('sdtimelining');

            if (!r.data || !r.data.length) console.warn('Empty internal camera timeline!');
            else self.timlineloaded=true;
            if (r.error_code=='not_connected'){
                if (!self.getState('notconnected'))
                    self.redux.send(self,'camera_connected',{value:false});
                throw 'not_connected';
            }
/*
            if (r2 && r2.objects && r2.objects[0] && r2.objects[0][3] && r2.objects[0][3].length) for (let i=0; i< r2.objects[0][3].length; i++){
                let st = (new Date(r2.objects[0][3][i][0]+'Z')).getTime();
                let et = st + r2.objects[0][3][i][1]*1000;
                self.storage.sdcard_timeline.addToRange(st, et-st);
            }
*/
            let lasttime;

            if (r && r.data && r.data.length)
                r.data.sort(function(a,b){
                    if (a['start']<b['start']) return -1;
                    if (a['start']>b['start']) return 1;
                    return 0;
                })

            if (r && r.data && r.data.length) for (let i=0; i< r.data.length; i++){
                let st = (new Date(r.data[i]['start']+'Z')).getTime();
                let et = (new Date(r.data[i]['end']+'Z')).getTime();
                if (i==0 && st>start_time) {
                    if (!self.storage.sdcard_timeline.range_times.length)
                        self.storage.sdcard_timeline.addToRange(start_time, start_time - st);
                    else if (self.storage.sdcard_timeline.range_times[0] > start_time)
                        self.storage.sdcard_timeline.addToRange(start_time, start_time - self.storage.sdcard_timeline.range_times[0]);
                }
                if (lasttime!==undefined && st-lasttime>0)
                    self.storage.sdcard_timeline.addToRange(lasttime, lasttime - st);
                self.storage.sdcard_timeline.addToRange(st, et-st);
                lasttime = et;
            } else
                self.storage.sdcard_timeline.addToRange(start_time, start_time - end_time);

            self.storage.sdcard_timeline.mergeIdentical();
            self.sendRangeUpdate(self.storage.sdcard_timeline.range_times,self.storage.sdcard_timeline.range_durations);
            self.updateCache();
        },function(r){
            self.clearState('firsttimelining');
            self.clearState('sdtimelining');
            //self.redux.post(self,'get_camera_timeline',{start_time:start_time,end_time:end_time,limit:limit,error:r,debug:'load fail from time '+(new Date(parseInt(start_time)).toISOString().replace('T',' '))+' to time '+(new Date(parseInt(end_time)).toISOString().replace('T',' '))});
            throw r;
        });
    }
    adjustTime(time, add_mks){
        if (this.check_times[parseInt(time/1000)*1000]===undefined) return time;
        return this.addMicro(this.check_times[parseInt(time/1000)*1000],add_mks);
    }
    compareMicro(t1,t2){
        t1 = t1.split('.');
        t2 = t2.split('.');
        let mks1 = t1[1] ? parseFloat('.'+t1[1]) : 0.0;
        let mks2 = t2[1] ? parseFloat('.'+t2[1]) : 0.0;
        t1 = new Date(t1[0]).getTime();
        t2 = new Date(t2[0]).getTime();
        if (t1<t2) return -1;
        if (t1>t2) return 1;
        if (mks1<mks2) return -1;
        if (mks1>mks2) return 1;
        return 0;
    }
    addMicro(time, add_mks){
        let v = time.split('.');
        let mks = (v[1] ? parseFloat('.'+v[1]) : 0.0) + add_mks/1000000;
        let add_sec = mks>=1 ? parseInt(mks) : (mks<0 ? parseInt(mks)-1 : 0);
        if (mks<0) mks+= - parseInt(mks) + 1.0;
        if (mks>=1) mks-=parseInt(mks);
        let t = new Date(v[0]+'Z').getTime() + add_sec*1000;
        let ret = new Date(t).toISOString().substr(0,19)+mks.toFixed(6).substr(1);
        return ret;
    }
    splay(){
        return super.play().catch(function(){});
    }

    play(){
        let self = this;
        this.setStatus('loading');
        this.setAttribute('autoplay','');
        return self.splay();
/*
        let d = this.shadow.querySelector('[pos="0"]').currentUtcTime - self.currentUtcTime;
        if (d<500){
            let player = self.shadow.querySelector('[pos="0"]');
            if (!player.isEmpty())
                self.splay();
            self.updateCache();
            return Promise.resolve();
        }
        return self.setTimePromise(self.currentUtcTime).then(function(){
            let player = self.shadow.querySelector('[pos="0"]');
            if (!player.isEmpty())
                self.splay();
            self.updateCache();
        });
*/
    }

    isCameraOnline(){
        let self = this;
        function autoUpdateStatus(){
            if (!self.isVisible())
                return new Promise(function(resolve, reject){setTimeout(function(){resolve();},self.CAMINFO_UPDATE_PERIOD);}).then(function(){return autoUpdateStatus();});
            self.setState('caminfo');
            return self.camera.getStatus().then(function(status){
                self.clearState('caminfo');
                self.last_status = status ? status : undefined;
                if (status==='active'){
                    if (self.getState('notconnected'))
                        self.redux.send(self,'camera_connected',{value:true});
                }else{
                    if (!self.getState('notconnected'))
                        self.redux.send(self,'camera_connected',{value:false});
                }
                self.clearState('caminfo');
                return new Promise(function(resolve, reject){setTimeout(function(){resolve();},self.CAMINFO_UPDATE_PERIOD);}).then(function(){return autoUpdateStatus();});
            },function(e){
                console.error('Fail to get camera info');
                self.clearState('caminfo');
                if (!self.getState('notconnected'))
                    self.redux.send(self,'camera_connected',{value:false, result:e});
                return new Promise(function(resolve, reject){setTimeout(function(){resolve();},self.CAMINFO_UPDATE_PERIOD);}).then(function(){return autoUpdateStatus();});
            });
        }
        if (!this.autoupdate_promise && (!this.last_status || this.last_status!=='active')){
            this.autoupdate_promise = autoUpdateStatus().then(function(){
                self.autoupdate_promise = undefined;
            },function(){
                self.autoupdate_promise = undefined;
            });
        }
        return !this.last_status || this.last_status=='active';
    }
    shiftToNextBlock(){
        if (!this.sdcardmode || !this.isCameraOnline())
            return super.shiftToNextBlock();
        let p = this.shadow.querySelector('[pos="1"]');
        let t = p.getFirstTime();
        if (t===undefined || !p.src && t>0 && parseInt(p.getAttribute('msec'))>=this.NOLOAD_DURATION && this.storage.sdcard_timeline.checkIncluded(t))
            return;
        return super.shiftToNextBlock();
    }
}


window.customElements.define('k-video-sdvxg', CKVgxSdVideo);
class CKPlayer extends HTMLElement {
  static get observedAttributes() {
    return ['src','time','msec','playtime'];
  }
  constructor() {
    super();
    this.controls = [];
  }
  setTimelineState(enable){
    let tl = this.shadow.querySelector('k-control-timepicker');
    if (!enable) tl.setAttribute('disabled','disabled');
    else tl.removeAttribute('disabled');
  }
  setLoggingEventsListCallback(listcallback){
    this.player.redux.setLoggingEventsListCallback(listcallback);
  }
  connectedCallback() {
    let self = this;
    this.style.position='relative';
    this.style.overflow='hidden';
    this.style.userSelect='none';
    this.style['-moz-user-select']='none';
    this.style['-webkit-user-select']='none';
    this.style['-ms-user-select']='none';

    this.shadow = this.attachShadow({mode: 'open'});
    let player_tag = this.getAttribute('videomodule')!==null ? this.getAttribute('videomodule') : 'k-video-vxg';
    let tag = player_tag == 'k-video' || player_tag == 'k-video-reverse' ? 'video' : player_tag;
    let controls = 'k-control-play k-control-timeinfo k-control-timepicker k-control-speed';
    if (this.getAttribute('controls')!==null) controls=this.getAttribute('controls');
    let controls_html='';let top_html='';
    while (controls.indexOf('  ')!==-1) controls = controls.replaceAll('  ',' ');
    controls = controls.trim().split(' ');
    for (let i = 0; i<controls.length; i++){
      let el = window.customElements.get(controls[i]);
      if (!el) continue;
      el = new el();
      if (!(el instanceof CKControl)) {
        console.warn(controls[i]+' is not instance of CKControl')
        continue;
      }
      let type = el.getType();
      if (type=='top')
        top_html += '<'+controls[i]+' class="k-control"></'+controls[i]+'>';
      else
        controls_html += '<div class="'+type+'"><'+controls[i]+' class="k-control"></'+controls[i]+'></div>';
      el = undefined;
    }
    let options = this.getAttribute('options')===null ? '' : " options='"+this.getAttribute('options')+"'";
    let over= (top_html || controls_html) ? ('<div class="over"><div class="top">'+top_html+'</div><div class="bottom">'+controls_html+'</div></div>') : '';
    if (!top_html && controls.length==1 && controls[0]=='k-control-timepicker')
      over= '<div class="over" style="opacity: 0;"><div class="top"></div><div class="bottom">'+controls_html+'</div></div>';

    let playtime = isNaN(parseInt(this.getAttribute('playtime'))) ? '' : ' playtime="'+parseInt(this.getAttribute('playtime'))+'"';
    this.shadow.innerHTML = '<style>'+CKPlayer.css+'</style>'+'<'+tag+(tag=='video'?' is="'+player_tag+'"':'')
      +(this.getAttribute('debuginfo')!==null?' debuginfo':'')
      +(this.getAttribute('autoplay')!==null?' autoplay':'')
      +(this.getAttribute('muted') !== null ? ' muted' : '')
      +(this.getAttribute('thumbnails')!==null?' thumbnails':'')
      +playtime+options+' innerkplayer'+(this.getAttribute('statuses')!==null?' statuses':'')+'></'+tag+'>'+over;
    this.player = this.shadow.querySelector('[innerkplayer]');
    let ks = this.shadow.querySelectorAll('.k-control');
    for (let i=0;i<ks.length;i++)
      ks[i].setRedux(this.player.redux);

    setTimeout(function(){self.player.redux.post(self,'media_scale',{value:self.clientWidth/self.clientHeight});},100);

    this.player.parent = this;
    if (!(this.player instanceof CKVideoAsync) && typeof this.player.setSourceListObserver === 'function'){
      this.player.setSourceListObserver(this);
      this.innerHTML+=' ';
    }
    this.over = this.shadow.querySelector('.over');
    this.shadow.querySelectorAll('.bottom > div > *, .top > *').forEach(function(el){
      if (typeof el.setPlayer !== 'function') return;
      self.controls.push(el);
      el.setPlayer(self);
    });
    if (playtime)
      setTimeout(function(){self.sendTimeUpdate();},0);
    this.player.addEventListener("videochanged", function(event){
      let kp_event_videochanged = new Event('videochanged',{cancelable: false, bubbles: true})
      kp_event_videochanged.video = event.video;
      self.dispatchEvent(kp_event_videochanged);
    });
    this.player.addEventListener("timeupdate", function(event){
      if (self.player.getAttribute('playtime')===null) return;
//            if (!self.player.isPlaying() && !self.new_src) return;
//            delete self.new_src;
      self.sendTimeUpdate(event.detail.currentUtcTime);
    },{once:false});
    this.player.addEventListener("statusupdate", function(event){
      self.setAttribute('status',event.status);
      if (event.status==='playing' || self.isPlaying()) self.classList.add('playing');
      else self.classList.remove('playing');
      let kp_event_statusupdate = new Event('statusupdate',{cancelable: false, bubbles: true})
      kp_event_statusupdate.status = event.status;
      self.dispatchEvent(kp_event_statusupdate);
    },{once:false});
    this.player.redux.subscribe("set_state", function(event){
      if (event && event.detail.event_param && event.detail.event_param.value) self.classList.add(event.detail.event_param.value);
    },{once:false});
    this.player.redux.subscribe("clear_state", function(event){
      if (event && event.detail.event_param && event.detail.event_param.value) self.classList.remove(event.detail.event_param.value);
    },{once:false});
    /*
            this.player.addEventListener("loadedmetadata", function(event){
                let w = !event ? 0 : (event.target && event.target.videoWidth ? event.target.videoWidth : (event.detail&&event.detail.src&&event.detail.src.videoWidth?event.detail.src.videoWidth:0));
                let h = !event ? 0 : (event.target && event.target.videoHeight ? event.target.videoHeight : (event.detail&&event.detail.src&&event.detail.src.videoHeight?event.detail.src.videoHeight:0));
                if (self.getAttribute('autoprop')===null || !w || !h) return;
                self.player.redux.post(self,'media_scale',{value:w/h});
                self.media_width = w;
                self.media_height = h;
                if (self.clientWidth)
                    self.style.height = ''+(self.clientWidth * h / w )+'px';
            },{once:false});
    */
    this.player.redux.subscribe('media_scale', function(event){
      if (event && event.detail.event_param && !isNaN(parseFloat(event.detail.event_param.value)) && self.getAttribute('autoprop')!==null){
        let nh = (self.clientWidth / parseFloat(event.detail.event_param.value) );
        if (self.style.height!=nh) self.style.height = ''+nh+'px';
      }
    });
    /*
            window.addEventListener("resize", function() {
                if (!self.media_width || !self.media_height) return;
                if (self.getAttribute('autoprop')!==null)
                    self.style.height = ''+(self.clientWidth * self.media_height / self.media_width )+'px';
            });
    */
    let attrs = this.getAttributeNames();
    for (let i=0; i<attrs.length; i++)
      this.attributeChangedCallback(attrs[i], '', this.getAttribute(attrs[i]));

    this.timepicker = this.shadow.querySelector('k-control-timepicker');
  }
  disconnectedCallback(){
    this.player.pause().catch(function(){});
    this.shadow.innerHTML='';
  }
  get currentUtcTime(){
    return this.player.currentUtcTime;
  }
  set currentUtcTime(time){
    this.player.currentUtcTime = time;
  }
  get playbackRate(){
    return this.player.speed;
  }
  set playbackRate(speed){
    this.player.setPlaybackRatePromise(speed).catch(function(){});
  }
  get volume(){
    return this.player.volume;
  }
  set volume(volume){
    this.player.volume = volume;
  }
  get muted(){
    return this.player?.muted;
  }
  set muted(v){
    if (this.player) {
      this.player.muted = v;
    }
  }
  setHook(hook_before, hook_after){
    this.hook_before = hook_before;
    this.hook_after = hook_after;
    let self = this;
    function sethook(){
      if (self.player.camera)
        self.player.camera.setHook(hook_before, hook_after);
      else setTimeout(sethook,100);
    }
    setTimeout(sethook,100);
  }
  getVideo(){
    return this.player.getVideo();
  }
  play(){
    let self = this;
    this.dispatchEvent(new Event('playing',{cancelable: false, bubbles: true}));

    return this.player.play().then(function(){
      self.controls.forEach(function(el){
        if (typeof el.onPlay === 'function') el.onPlay();
      });
    }).catch(function(){});
  }
  pause(){
    let self = this;
    if (this.player.isPlaying()){
      this.dispatchEvent(new Event('pause',{cancelable: false, bubbles: true}));
    }
    return this.player.pause().catch(function(){}).finally(function(){
      self.controls.forEach(function(el){
        if (typeof el.onPause === 'function') el.onPause();
      });
    });
  }
  isPlaying(){return this.player.isPlaying();}


  setTimePromise(utctime,mode){
    let self = this;
    //We will use this mode only for changing position, not for sliding. 
    if (mode && mode==1)
      return this.player.setTimePromise1(utctime).then(function(){
        if (!self.player.currentUtcTime) return;
        self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.player.currentUtcTime}}));
      });
    else    
    return this.player.setTimePromise(utctime).then(function(){
      if (!self.player.currentUtcTime) return;
      self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.player.currentUtcTime}}));
    });
  }

  set currentTime(time){
    this.setTimePromise(time);
  }

  get currentTime(){
    return parseInt(this.getAttribute('playtime'));
  }

  sendTimeUpdate(utctime){
    if (isNaN(utctime)) utctime = this.player.currentUtcTime;
    if (!utctime) return;
    this.do_not_update_playtime=true;
    this.setAttribute('playtime',utctime);
    this.do_not_update_playtime=undefined;
    this.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:utctime}}));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    let self=this;
    if (!this.player)
      return;
    if (name==='src') {
//            self.new_src = true;
      self.player.clearState('invalidtoken');
      self.player.classList.add('loading');
      if (!newValue) {
        self.player.src = '';
        self.player.invalidate();
        return;
      }
      if (self.player.camera)
        self.player.camera.setHook(self.hook_before, self.hook_after);
      else{
        self.player.invalidate();
        self.player.sendRangeUpdate([],[]);
      }
      try{
        self.player.src = newValue;
        if (self.getAttribute('autoplay')!==null)
          self.play();
      }catch(e){
        self.player.setState('invalidtoken');
        self.player.classList.remove('loading');
      }

      setTimeout(() => {
        self.player?.classList?.remove('loading');
      }, 1000);
    }
    if (this.shadow && name==='playtime' && newValue!==null && !this.do_not_update_playtime){
      let t = parseInt(newValue);
      if (!isNaN(t))
        self.player.setTimePromise(t).then(function(){
          if (!self.player.currentUtcTime) return;
          self.dispatchEvent(new CustomEvent('timeupdate',{cancelable: false, bubbles: true, detail: {currentUtcTime:self.player.currentUtcTime}}));
        }).catch(() => {});
    }

    if (name==='time') setTimeout(function(){self.player.setAttribute('time',newValue);},0);
    if (name==='msec') setTimeout(function(){self.player.setAttribute('msec',newValue);},0);
  }
  static get css() {
    return `
[innerkplayer]{width:100%;height:100%;}
.over{position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;}
.top{flex:100;position:relative;}
.bottom{background:#0004;flex:1;min-height:40px;display:flex;flex-direction:row;border-bottom: 5px solid #0008;border-top: 5px solid #0008;}
.bottom > div{background:#00000080;}
.bottom .min{flex:1;min-width:40px;max-width:40px;}
.bottom .double{flex:1;min-width:80px;min-width:80px;}
.bottom .full{flex:100;}
k-timeline-picker{display:block;width:100%;height:100%;background:#00000080;color:white;font-family:monospace;font-size:15px;}
[innerkplayer][statuses][status]:before {font-size:40px;color:black;z-index:10000;display:block;background:#fffb;padding:10px 20px;position:absolute;right:0;}
[innerkplayer][statuses]:before {content:attr(status);}
[innerkplayer][statuses]:after{max-width:115px;position: absolute;display: block;right: 0;top: 68px;background: #fffb;padding: 10px 15px;}
[innerkplayer][statuses]:after{content:attr(class)}
[innerkplayer].invalidtoken{display:none;}
[innerkplayer].loading{display:none;}
`;
  }
}

window.customElements.define('vxg-cloud-player', CKPlayer);
