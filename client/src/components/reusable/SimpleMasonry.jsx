import React, { Component, Fragment } from 'react';

class SimpleMasonry extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      images: props.images || [],
      width: props.width,
      targetHeight: props.targetHeight,
    };

    this.container = React.createRef();
    this.handleResize = this.handleResize.bind(this);
  }

  handleResize() {
    if (this.container.current) {
      const width = Math.floor(this.container.current.offsetWidth);

      if (this.state.width != width) {
          this.setState({ width });
      }
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  calcImages(images, width, targetHeight) {
    if (!width) {
      return [];
    }

    //console.time("calcImages");

    var rowsMax = null;
    var rowsMaxHeight = 0;
    for (var r = 1; r <= images.length; r++) {
      for (var layout = 0; layout < 2; layout++) {
        const itemsPerRowMax = Math.min(Math.ceil(images.length / r), r);
        const itemsPerRowMin = Math.max(itemsPerRowMax - 1, 1);

        var rows = [];
        var pos = 0;
        for (var row = 0; row < r; row ++) {
          var itemsPerRow = (row % 2 == 0) ? 
          (layout ? itemsPerRowMin : itemsPerRowMax)
          : (layout ? itemsPerRowMax : itemsPerRowMin);

          if (pos + itemsPerRow + (r - row - 1) > images.length) {
            itemsPerRow = images.length - (r - row - 1) - pos;
          }

          if (row === r - 1) {
            rows.push(images.slice(pos).map((i, p) => { return { aspect: i.aspect, index: pos + p }; }));
          } else {
            rows.push(images.slice(pos, pos + itemsPerRow).map((i, p) => { return { aspect: i.aspect, index: pos + p }; }));
          }
          pos += itemsPerRow;
        }

        const gap = 15;

        var sumHeight = 0;
        rows.forEach(row => {
          
            /*
              h / a1 + gap + h / a2 + gap +... h / an = w

              h = w - gap * (n - 1) * (a1*a2...an) / (a2*a3*...an + a1*a3*...an + ....)
            */

            const mulAspect = row.reduce((r, i) => r * i.aspect, 1);
            const sumAspects = row.reduce((r, i) => r + row.reduce((res, v) => res * (i !== v ? v.aspect : 1), 1), 0);
            const h = (width - gap * (row.length - 1)) * mulAspect / sumAspects;

            row.forEach(img => { 
              img.width = h / img.aspect; 
              img.height = h; 
            });

            if (sumHeight > 0) {
              sumHeight += gap;
            }
            sumHeight += h;
        });

        var factor = 0; // compute differency of dividings between each two neighbour rows
        for (var i = 1; i < r; i++) {
          const div1 = rows[i - 1].slice(0, rows[i - 1].length - 1)
            .map((t, index, a) => a.slice(0, index + 1).reduce((s, img) => s + img.width, 0)).map(v => Math.round(v / 20));
          const div2 = rows[i].slice(0, rows[i].length - 1)
            .map((t, index, a) => a.slice(0, index + 1).reduce((s, img) => s + img.width, 0)).map(v => Math.round(v / 20));

          const diff = div1
            .filter(x => !div2.includes(x))
            .concat(div2.filter(x => !div1.includes(x)));

          factor += (diff.length / Math.max(1, div1.length + div2.length)) / r;
        }

        const sumHeightWithFactor = sumHeight 
          - (sumHeight > targetHeight ? (sumHeight - targetHeight) : 0)
          + (targetHeight / 3) * factor;
        
        //console.log("Rows: " + rows.map(r => r.length).join(",") + " Height: " + sumHeight + " + Factor: " + factor + " = " + sumHeightWithFactor);

        if (sumHeight <= targetHeight * 1.25 && sumHeightWithFactor > rowsMaxHeight) {
          rowsMaxHeight = sumHeightWithFactor;
          rowsMax = rows;
        }

        if (sumHeight > targetHeight * 1.25)
        {
          //console.timeEnd("calcImages");
          return rowsMax || rows;
        }
      }
    }

    //console.timeEnd("calcImages");

    return rowsMax || rows;
  }

  render() {    
    const imageRows = this.calcImages(this.state.images, this.state.width, this.state.targetHeight);

    return (
      <div className="simple-masonry" ref={this.container}>
        {imageRows.map((row, r) => {
          const innerRow = r < imageRows.length - 1;
          
          return (
            <Fragment key={r}>
              {row.map((item, i) => {
                const img = this.state.images[item.index];

                return (
                  <div key={i} className={`simple-masonry-item${innerRow ? ' inner' : ''}`} 
                    style={{ width: item.width, height: item.height, maxHeight: this.state.targetHeight }}>
                    <a href={img.url} title={item.width < 100 ? img.title : ""} >
                      <div className="simple-masonry-image" style={{ backgroundImage: "url(" + img.src + ")"}}/>
                      {item.width >= 100 && (<div className="simple-masonry-image-title"  style={{ maxWidth: item.width }}>
                        {item.height >= 100 ? img.title : ""}<span><i className="fas fa-external-link-alt"/></span></div>)}
                    </a>
                  </div>
                  );})}
              {innerRow && (<div className="simple-masonry-br"/>)}
            </Fragment>)}
          )}
      </div>);
    }
}


export default SimpleMasonry;