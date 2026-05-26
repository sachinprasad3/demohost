

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useGetWhatsAppLoginRecords,
  useWhatsAppLogin,
  useWhatsAppLogout,
} from "../../services/linkWhatsapp.services";
import { useAuth } from "../../context/AuthContext";

const LinkWhatsapp = () => {
  const { user } = useAuth();

  const {
    data: loginRecordsResponse,
    refetch: refetchLoginRecords,
  } = useGetWhatsAppLoginRecords();


  const { mutateAsync: fetchQr, data: loginQr, isPending } = useWhatsAppLogin();
  // console.log("loginQr", loginQr)
  const records = useMemo(() => {
    return loginRecordsResponse?.data || [];
  }, [loginRecordsResponse]);

  const hasActiveSession = records.length > 0;

  const { mutate: logoutWhatsapp } = useWhatsAppLogout();

  const [qrUrl, setQrUrl] = useState(null);
  const [loginCompleted, setLoginCompleted] = useState(false);

  const qrInFlightRef = useRef(false);
  const qrTimerRef = useRef(null);
  const recordsIntervalRef = useRef(null);
  const recordsStopTimerRef = useRef(null);
  const flowStartedRef = useRef(false);
  const loginCompletedRef = useRef(false);
  const qrCountdownIntervalRef = useRef(null);
  const [qrCountdown, setQrCountdown] = useState(0);

  useEffect(() => {
    loginCompletedRef.current = loginCompleted;
  }, [loginCompleted]);


  useEffect(() => {
    if (records.length > 0) {
      setLoginCompleted(true);
    }
  }, [records]);



  useEffect(() => {
    if (!user?.userId) return;
    if (flowStartedRef.current) return; //  start only once

    flowStartedRef.current = true;

    const runFlow = async () => {
      //  HARD BLOCK: never call QR twice
      if (qrInFlightRef.current) return;

      qrInFlightRef.current = true;

      try {
        //  Fetch QR
        await fetchQr(user.userId);
      } catch (err) {
        console.error("QR fetch failed", err);
        startQrCountdown(30);
        //  If  → back off harder
        qrTimerRef.current = setTimeout(() => {
          qrInFlightRef.current = false;
          if (!loginCompletedRef.current) {
            runFlow();
          }
        }, 30000); // ⏳ backoff to 30s

        return;
      }

      qrInFlightRef.current = false;

      //  Clear old timers
      if (recordsIntervalRef.current) clearInterval(recordsIntervalRef.current);
      if (recordsStopTimerRef.current) clearTimeout(recordsStopTimerRef.current);

      //  Poll records every 5s (15s window)
      recordsIntervalRef.current = setInterval(() => {
        if (loginCompletedRef.current) {
          clearInterval(recordsIntervalRef.current);
          return;
        }
        refetchLoginRecords();
      }, 10000);

      recordsStopTimerRef.current = setTimeout(() => {
        if (recordsIntervalRef.current) {
          clearInterval(recordsIntervalRef.current);
        }
      }, 30000);
      startQrCountdown(30);
      //  Next QR strictly AFTER 16s
      qrTimerRef.current = setTimeout(() => {
        if (!loginCompletedRef.current) {
          runFlow();
        }
      }, 30000);
    };


    runFlow();

    return () => {
      flowStartedRef.current = false;

      if (qrTimerRef.current) {
        clearTimeout(qrTimerRef.current);
        qrTimerRef.current = null;
      }
      if (qrCountdownIntervalRef.current) {
        clearInterval(qrCountdownIntervalRef.current);
        qrCountdownIntervalRef.current = null;
      }

      if (recordsIntervalRef.current) {
        clearInterval(recordsIntervalRef.current);
        recordsIntervalRef.current = null;
      }

      if (recordsStopTimerRef.current) {
        clearTimeout(recordsStopTimerRef.current);
        recordsStopTimerRef.current = null;
      }
    };
  }, [fetchQr, refetchLoginRecords, user?.userId]);


  useEffect(() => {
    if (!loginQr) return;

    const blob = new Blob([loginQr], { type: "image/png" });
    const url = URL.createObjectURL(blob);
    setQrUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [loginQr]);
  const startQrCountdown = (seconds) => {
    setQrCountdown(seconds);

    if (qrCountdownIntervalRef.current) {
      clearInterval(qrCountdownIntervalRef.current);
    }

    qrCountdownIntervalRef.current = setInterval(() => {
      setQrCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(qrCountdownIntervalRef.current);
          qrCountdownIntervalRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const handleLogout = () => {
    logoutWhatsapp(undefined, {
      onSuccess: () => {
        refetchLoginRecords();
        setLoginCompleted(false);
      },
    });
  };


  return (
    <>
      <style>{`
      .badge-active {
  background-color: #28a745;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-inactive {
  background-color: #6c757d;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.logout-btn {
  background-color: #dc3545;
  border: none;
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #c82333;
}

     
 

        
     `}</style>

      {!hasActiveSession && (
        <div className="mainpro">
          <div className="container"> 
                {/* LEFT – QR */}
                <div className="qrsec">
                  <ul>
                    <li className="fullsec">
                      <div className="whitebox">
                        {!qrUrl && <div className="qr-box">Generating QR…</div>}

                        {qrUrl && (
                          <div className="qr-box">
                            <p className="qr-text">Kindly scan here</p>
                            <img src={qrUrl} alt="WhatsApp QR" />
                          </div>
                        )}
                      </div>
                    </li>
                    <li className="fullsec">
                        <div className="whitebox">
                  <div>
                    <h4>Link WhatsApp</h4>
                    <ol>
                      <li>Open WhatsApp on your phone</li>
                      <li>Tap <strong>Menu</strong> or <strong>Settings</strong></li>
                      <li>Select <strong>Linked Devices</strong></li>
                      <li>Tap <strong>Link a Device</strong></li>
                      <li>Scan the QR code shown</li>
                    </ol>
                  </div>
                  <p className="text-muted mt-2 text-center">
                  Next QR in <strong>{qrCountdown}s</strong>
                </p> 
                </div>
                    </li>
                  </ul>
                </div> 
                 
          </div>
        </div>
      )}

      {hasActiveSession && (
        <div className="container mt-4">
          <h4>WhatsApp Login Records</h4>
          <div className="listsec">
          <div className="listbox academicterm theading">
            <div>ID</div>
            <div>Contact No</div> 
           <div>Logged In</div>
            <div>Logged In At</div>
            <div>Action</div>
          </div>
          <ul>
             {records.map((rec) => {
                const isActive = rec.status === "ACTIVE"; 
                return (
              <li key={rec.id}>
                <div className="listbox academicterm"> 
                    <div>{rec.id}</div>
                    <div data-head="Contact No">{rec.contact_no || "-"}</div>  
                    <div data-head="Logged In">{rec.logged_in ? "Yes" : "No"}</div>
                    <div data-head="Logged In At"> {rec.logged_in_at ? new Date(rec.logged_in_at).toLocaleString() : "-"}</div>
                    <div className="actionbtns actions-heading">
                      <span className={isActive ? "badge-active" : "badge-inactive"}>{rec.status || "UNKNOWN"}</span>
                      {isActive && (<button className="logout-btn" onClick={() => handleLogout()} >Logout</button>)} 
                    </div>
                    </div>
              </li>
                );
              })}
          </ul>
          </div> 

        
        </div>
      )}

    </>
  );
};

export default LinkWhatsapp;
