// ProgressBar.js
import React from "react";

const ProgressBar = ({ progress }) => {
    return (
        <div style={{ width: "100%", backgroundColor: "#f3f3f3", borderRadius: "5px" }}>
            <div
                style={{
                    width: `${progress}%`,
                    backgroundColor: progress < 100 ? "#4caf50" : "#2196F3",
                    height: "30px",
                    borderRadius: "5px",
                    textAlign: "center",
                    lineHeight: "30px",
                    color: "white",
                    fontWeight: "bold",
                }}
            >
                {progress}%
            </div>
        </div>
    );
};

export default ProgressBar;
