'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material'

const TableExample = ({data}) => {
    if (!data || data.length === 0) {
        return <Typography>No data available</Typography>
    }


    const columns = [
        "Model Name",
        "True Negative",
        "False Positive",
        "False Negative",
        "True Positive",

    ]

    const rowColors = [
        '#a7e79d',
        '#a7e79d',
        '#8997f9',
        '#8997f9',
        '#f87b8a',
        '#f87b8a',
        '#bce1e5'
    ]

    return (
        <TableContainer component={Paper} sx={{ maxWidth: 800, margin: 'auto', borderRadius: 2, boxShadow: 3 }}>
            <Table aria-label="simple table" sx={{ borderCollapse: 'separate', borderSpacing: '0 15px' }}>
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
                        const rowColor = rowColors[index] || '#ffffff' // گرفتن رنگ از آرایه به صورت دستی

                        return (
                            <TableRow key={index} sx={{ backgroundColor: rowColor }}>
                                <TableCell component="th" scope="row" sx={{ borderRight: '2px solid #ddd', padding: '12px' }}>
                                    <Typography variant="body1">{row.MODEL}</Typography>
                                </TableCell>
                                {row.CM.map((cmItem, cmIndex) => (
                                    <>
                                        <TableCell key={`not-fraud-${cmIndex}`} align="center" sx={{ borderRight: '2px solid #ddd', padding: '12px' }}>
                                            <Typography variant="body2">{cmItem['Not Fraud']}</Typography>
                                        </TableCell>
                                        <TableCell key={`fraud-${cmIndex}`} align="center" sx={{ padding: '12px' }}>
                                            <Typography variant="body2">{cmItem['Fraud']}</Typography>
                                        </TableCell>
                                    </>
                                ))}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            <p>• True Negative: Not Fraud Transactions recognized True</p>
            <p>• False Positive: Not Fraud Transactions recognized False</p>
            <p>• False Negative: Fraud Transactions recognized False</p>
            <p>• True Positive: Fraud Transactions recognized True</p>
        </TableContainer>
    )
}

export default TableExample

