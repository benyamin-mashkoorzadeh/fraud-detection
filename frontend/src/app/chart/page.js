'use client'

import TableCM from "@/components/TableCM";
import TableScore from "@/components/TableScore";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";  // اضافه کردن Button از MUI

export default function Home() {
    const [scoreData, setScoreData] = useState([]);
    const [cmData, setCmData] = useState([]);
    const [showData, setShowData] = useState(false); // وضعیت برای کنترل نمایش داده‌ها

    useEffect(() => {
        fetch("http://localhost:8000/api/show-data")
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data && Array.isArray(data.scoreData) && Array.isArray(data.cmData)) {
                    setScoreData(data.scoreData);
                    setCmData(data.cmData);
                } else {
                    console.error("Invalid data format received:", data);
                }
            })
            .catch(error => console.error("Error fetching JSON:", error));
    }, []);

    // تابع برای تغییر وضعیت نمایش داده‌ها
    const toggleDataDisplay = () => {
        setShowData(prevState => !prevState);
    };

    return (
        <div>
            <h1>Fraud Detection Chart Based on Different Models</h1>

            {/* دکمه برای نمایش داده‌ها */}
            <Button
                variant="contained"
                color="primary"
                onClick={toggleDataDisplay}
                sx={{ margin: '20px 0' }}
            >
                {showData ? 'Hide Data' : 'Show Data'}  {/* متن دکمه به وضعیت بستگی دارد */}
            </Button>

            {/* نمایش داده‌ها زمانی که showData برابر true است */}
            {showData && (
                <>
                    <TableCM data={cmData} />
                    <br/><br/>
                    <TableScore data={scoreData} />
                </>
            )}
        </div>
    );
}
