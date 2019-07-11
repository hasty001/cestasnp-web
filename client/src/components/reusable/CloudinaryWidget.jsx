import React from 'react';

class CloudinaryWidget extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            myWidget: ''
        }
    }

    componentDidMount() {
        const myWidget = cloudinary.createUploadWidget({
            cloudName: 'cestasnp-sk',
            apiKey: '186532245374812',
            uploadSignature: this.generateSignature,
            uploadPreset: 'eo9nitmv',
            sources: ['local', 'camera'],
            multiple: false,
            resourceType: "image",
            cropping: false,
            tags: ['live_sledovanie'],
            public_id: `${this.props.uid}_${Date.now()}`,
            clientAllowedFormats: ["png", "jpg", "jpeg"],
            thumbnailTransformation: [
                { width: 248, height: 140, crop: "fill" },
                { width: 800, height: 400, crop: "fill" }],
        }, (error, result) => {
            if (!error && result && result.event === "success") {
                console.log('Done! Here is the image info: ', result.info)
                this.props.updateImageDetails(result.info)
            } else if (error) {
                console.error('Error ', error)
                this.props.updateImageDetails('')
            }
        }
        )

        this.setState({
            myWidget
        })
    }

    generateSignature = (callback, params_to_sign) => {
        fetch('/api/cloudinary/generateSignature', {
            method: 'POST',
            body: JSON.stringify(params_to_sign),
            headers: new Headers({
                'Content-Type': 'application/json',
            }),
        })
            .then(res => res.json())
            .then(signature => {
                callback(signature)
            })
            .catch(err => {
                console.error('cloudinary err ', err)
            })
    }

    openWidget = () => {
        this.state.myWidget.open()
    }

    render() {
        return(
            <button id = "upload_widget" className = "snpBtnWhite" onClick = { this.openWidget } > { this.props.btnTxt }</button>
        )
    }
}

export default CloudinaryWidget
