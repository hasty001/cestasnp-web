import { Plugin } from '@uppy/core';
import { logDev } from '../../helpers/logDev';

class UppyResizePlugin extends Plugin {
    constructor (uppy, opts) {
      super(uppy, opts);

      this.id = opts.id || 'UppyResizePlugin';
      this.type = 'uppy-resize';
      this.prepareUpload = this.prepareUpload.bind(this);
      this.maxSize = opts.maxSize;
      this.maxFileSize = opts.maxFileSize;
    }

    resize(blob) {
      return new Promise((resolve, reject) => {
        const img = new Image();

        const checkAndResolve = (result) => {
          logDev(result, result.size);
          if (result.size > this.maxFileSize) {
            return reject(new Error("Tento súbor presahuje maximálnu povolenú veľkosť súboru 2 MB. Musíš ho pred nahrávaním zmenšiť."));
          }

          resolve(result);
        }

        logDev("resize");

        img.onerror = (err) => { logDev("error", err); checkAndResolve(blob); }

        if (FileReader) {
          const fr = new FileReader();
          fr.onload = function () {
            img.src = fr.result;
          }
          fr.readAsDataURL(blob);
        } else {
          return checkAndResolve(blob);
        }

        const doResize = (blob) => new Promise((resolve, reject) => {
          try {              
            var width = this.maxSize;
            var height = this.maxSize;

            if(img.height > img.width) {
              width = Math.floor(height * (img.width / img.height));
            } else {
              height = Math.floor(width * (img.height / img.width));
            }

            logDev("Resize to", width, height);

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            var oc = document.createElement('canvas');
            var octx = oc.getContext('2d');

            canvas.width = width;
            canvas.height = height;

            var cur = {
              width: Math.floor(img.width * 0.5),
              height: Math.floor(img.height * 0.5)
            }

            oc.width = cur.width;
            oc.height = cur.height;

            octx.drawImage(img, 0, 0, cur.width, cur.height);

            while (cur.width * 0.5 > width) {
              cur = {
                width: Math.floor(cur.width * 0.5),
                height: Math.floor(cur.height * 0.5)
              };
              octx.drawImage(oc, 0, 0, cur.width * 2, cur.height * 2, 0, 0, cur.width, cur.height);
            }

            ctx.drawImage(oc, 0, 0, cur.width, cur.height, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(result => resolve(result), "image/jpeg", 0.8);
          } catch {
            resolve(blob);
          }
        });

        img.onload = () => {
          if(img.height <= this.maxSize && img.width <= this.maxSize) {
            checkAndResolve(blob);
          } else {
            doResize(blob)
            .then(result => checkAndResolve(result));
          }
        };
      });
    }
  
    prepareUpload(fileIDs) {
      const promises = fileIDs.map((fileID) => {
        const file = this.uppy.getFile(fileID)
        this.uppy.emit('preprocess-progress', file, {
          mode: 'indeterminate',
          message: 'úprava pre nahrávanie'
        })
  
        if (file.type.split('/')[0] !== 'image') {
          return
        }
  
        return this.resize(file.data).then((blob) => {
          this.uppy.setFileState(fileID, { data: blob, size: blob.size });
        }).catch((err) => {
          logDev(err);
          
          this.uppy.setState({
            error: err.message
          });
    
          this.uppy.setFileState(file.id, {
            error: err.message,
          });

          return Promise.reject(err);
        })
      })
  
      const emitPreprocessCompleteForAll = () => {
        fileIDs.forEach((fileID) => {
          const file = this.uppy.getFile(fileID);
          this.uppy.emit('preprocess-complete', file);
        })
      }
  
      return Promise.all(promises)
        .then(emitPreprocessCompleteForAll);
    }
  
    install() {
      this.uppy.addPreProcessor(this.prepareUpload);
    }
  
    uninstall() {
      this.uppy.removePreProcessor(this.prepareUpload);
    }
  }

  export default UppyResizePlugin;