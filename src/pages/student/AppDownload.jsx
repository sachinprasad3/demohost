import React, { useContext, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { LogoContext } from "../../context/LogoContext";

const AppDownload = () => {

  const printRef = useRef();
  const qrRef = useRef();

  const logoCtx = useContext(LogoContext);
  const logoUrl = logoCtx?.logoUrl || "/images/default-logo.png";

  const handlePrint = () => {

    // convert canvas to image
    const canvas = qrRef.current.querySelector("canvas");
    const qrImage = canvas.toDataURL("image/png");

    const printContents = printRef.current.innerHTML;

    const newWindow = window.open("", "", "width=900,height=650");

    newWindow.document.write(`
      <html>
      <head>
        <title>Download App</title>

        <style>
          body{
            font-family: Arial;
            text-align:center;
            padding:40px;
          }

          .applinkpage{
            max-width:750px;
            margin:auto;
          }

          .logo{
            height:90px;
            margin-bottom:15px;
          }

          h2{
            color:#333;
          }

          .qr img{
            width:460px;
            height:460px;
          }

        </style>

      </head>

      <body>

        <div class="applinkpage">
          <img src="${logoUrl}" class="logo"/>

          <h2>Download Android Mobile App</h2> 
          <div class="qr">
            <img src="${qrImage}" />
          </div>
           <p>Scan the QR Code to download the app</p>

        </div>

      </body>

      </html>
    `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
  };

  return (
    <div className="containersec" style={{ textAlign: "center", width:"600px", background:"#fff", padding:"30px", borderRadius:"20px", margin:"30px auto" }}>
      
      <div ref={printRef} className="applinkpage">

        <img
          src={logoUrl}
          alt="Logo"
          className="logo"
          style={{ height: 70 }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/defaultuser.jpg";
          }}
        />

        <h2>Download Android Mobile App</h2>
        

        <div className="qr" ref={qrRef}>
          <QRCodeCanvas
            value="https://playschoolual.s3.ap-south-1.amazonaws.com/NEEV_28022026.apk"
            size={450}
          />
        </div>
        <p>Scan the QR Code to download the app</p>

      </div>

      <button onClick={handlePrint} className="btn btn-primary mt-3" >
        Print Page
      </button>

    </div>
  );
};

export default AppDownload;