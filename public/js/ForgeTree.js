var direction = new THREE.Vector3();

// Zhiyuan Li's test function for Forge API
function test_fuction(){
  // function 1: goto 1 floor
  // 1-1 print out information of all builds
  for (child of viewables.parent.children){
    console.log("building information: " + child);
    alert(child);
  }
  console.log("building information: " + viewables.parent.children[0].data);
}


$(document).ready(function () {
    prepareAppBucketTree();
    $('#refreshBuckets').click(function () {
      $('#appBuckets').jstree(true).refresh();
    });
    
    $('#testForgeAPI').click(function () {
      console.log("received click event for 1st testForgeAPI!");
      launchViewer(-1); // urn is from json, -1 is just a place holder
    });

    // AHU-2, dbid = [14519]
    $('#testForgeAPI2').click(function () {
      var dbid = 14519;
      console.log("received click event for 2nd testForgeAPI! dbid = " + dbid);
      // use "viewer.getSelection()" to print dbid of item you want
      viewer.isolate([dbid]);
      viewer.fitToView([dbid]);
    });

    // zoom in programmatically
    $('#testForgeAPI_zoom_in').click(function () {
      var sb=viewer.getCamera();
      sb.getWorldDirection( direction );
      var dist_scale = 10;
      sb.position.add( direction.multiplyScalar(dist_scale) );
      viewer.navigation.setView(sb.position,viewer.navigation.getTarget());
    });

    // zoom out programmatically
    $('#testForgeAPI_zoom_out').click(function () {
      var sb=viewer.getCamera();
      sb.getWorldDirection( direction );
      var dist_scale = -10;
      sb.position.add( direction.multiplyScalar(dist_scale) );
      viewer.navigation.setView(sb.position,viewer.navigation.getTarget());
    });

    $('#createNewBucket').click(function () {
      createNewBucket();
    });

    $('#createBucketModal').on('shown.bs.modal', function () {
      $("#newBucketKey").focus();
    })

    $('#hiddenUploadField').change(function () {
      var node = $('#appBuckets').jstree(true).get_selected(true)[0];
      var _this = this;
      if (_this.files.length == 0) return;
      var file = _this.files[0];
      switch (node.type) {
        case 'bucket':
          var formData = new FormData();
          formData.append('fileToUpload', file);
          formData.append('bucketKey', node.id);

          $.ajax({
            url: '/api/forge/oss/objects',
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
              $('#appBuckets').jstree(true).refresh_node(node);
              _this.value = '';
            }
          });
          break;
      }
    });
  });

  function createNewBucket() {
    var bucketKey = $('#newBucketKey').val();
    jQuery.post({
      url: '/api/forge/oss/buckets',
      contentType: 'application/json',
      data: JSON.stringify({ 'bucketKey': bucketKey }),
      success: function (res) {
        $('#appBuckets').jstree(true).refresh();
        $('#createBucketModal').modal('toggle');
      },
      error: function (err) {
        if (err.status == 409)
          alert('Bucket already exists - 409: Duplicated')
        console.log(err);
      }
    });
  }

  function prepareAppBucketTree() {
    $('#appBuckets').jstree({
      'core': {
        'themes': { "icons": true },
        'data': {
          "url": '/api/forge/oss/buckets',
          "dataType": "json",
          'multiple': false,
          "data": function (node) {
            return { "id": node.id };
          }
        }
      },
      'types': {
        'default': {
          'icon': 'glyphicon glyphicon-question-sign'
        },
        '#': {
          'icon': 'glyphicon glyphicon-cloud'
        },
        'bucket': {
          'icon': 'glyphicon glyphicon-folder-open'
        },
        'object': {
          'icon': 'glyphicon glyphicon-file'
        }
      },
      "plugins": ["types", "state", "sort", "contextmenu"],
      contextmenu: { items: autodeskCustomMenu }
    }).on('loaded.jstree', function () {
      $('#appBuckets').jstree('open_all');
    }).bind("activate_node.jstree", function (evt, data) {
      if (data != null && data.node != null && data.node.type == 'object') {
        $("#forgeViewer").empty();
        var urn = data.node.id;
        // console.log("urn = data.node.id : " + urn)
        getForgeToken(function (access_token) {
          jQuery.ajax({
            url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest',
            headers: { 'Authorization': 'Bearer ' + access_token },
            success: function (res) {
              // $("#forgeViewer").html(res.status);
              // $("#forgeViewer").empty();
              if (res.status === 'success') launchViewer(urn);
              else $("#forgeViewer").html('The translation job still running: ' + res.progress);
            },
            error: function (err) {
              var msgButton = 'This file is not translated yet! ' +
                '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
                'Start translation</button>'
              $("#forgeViewer").html(msgButton);
            }
          });
        })
      }
    });
  }

  function autodeskCustomMenu(autodeskNode) {
    var items;

    switch (autodeskNode.type) {
      case "bucket":
        items = {
          uploadFile: {
            label: "Upload file",
            action: function () {
              uploadFile();
            },
            icon: 'glyphicon glyphicon-cloud-upload'
          }
        };
        break;
      case "object":
        items = {
          translateFile: {
            label: "Translate",
            action: function () {
              var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
              translateObject(treeNode);
            },
            icon: 'glyphicon glyphicon-eye-open'
          }
        };
        break;
    }

    return items;
  }

  function uploadFile() {
    $('#hiddenUploadField').click();
  }

  function translateObject(node) {
    $("#forgeViewer").empty();
    if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0];
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    jQuery.post({
      url: '/api/forge/modelderivative/jobs',
      contentType: 'application/json',
      data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
      success: function (res) {
        $("#forgeViewer").html('<p>Translation started! Please try again in a moment. </p> <p>'+objectKey+'</p>');
      },
    });
  }