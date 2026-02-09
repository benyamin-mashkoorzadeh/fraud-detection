'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'

const TableExample = ({ data }) => {
    if (!data || data.length === 0) {
        return <Typography>No data available</Typography>;
    }


    const columns = [
        "MODEL",
        "Accuracy Score",
        "Precision Score",
        "Recall Score",
        "F1 Score",
        "AUC",
        "MCC"
    ]


    const rowColors = [
        '#bce1e5',
        '#8997f9',
        '#f87b8a',
        '#a7e79d',
        '#f87b8a',
        '#8997f9',
        '#a7e79d'
    ]

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 800, margin: 'auto', borderRadius: 2, boxShadow: 3 }}>
            <Table aria-label="simple table" sx={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f4f4f4' }}>
                        {columns.map((column, index) => (
                            <TableCell key={index} sx={{ fontWeight: 'bold', borderBottom: '2px solid #ddd' }}>
                                {column}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => {
                        const rowColor = rowColors[index] || '#ffffff'

                        return (
                            <TableRow key={index} sx={{ backgroundColor: rowColor }}>
                                <TableCell component="th" scope="row" sx={{ borderRight: '2px solid #ddd', padding: '12px' }}>
                                    <Typography variant="body1">{row.index}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.accuracy_score.toFixed(6)}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.percision_score.toFixed(6)}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.recall_score.toFixed(6)}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.f1_score.toFixed(6)}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.AUC.toFixed(6)}</Typography>
                                </TableCell>
                                <TableCell align="center" sx={{ padding: '12px' }}>
                                    <Typography variant="body2">{row.MCC.toFixed(6)}</Typography>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    )
}

export default TableExample
