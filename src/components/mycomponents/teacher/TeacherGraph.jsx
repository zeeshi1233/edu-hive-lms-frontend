import React from 'react'
import GradientLineChart from '../../child/GradientLineChart'
import AttendanceChart from './AttendanceChart'


const TeacherGraph = () => {
    return (
        <div className="row gy-4">
{/*            
            <DefaultLineChart />

           
            <ZoomAbleLineChart />

           
            <LineDataLabel />

           
            <DoubleLineChart /> */}

            {/* StepLineChart */}
            <AttendanceChart />

            {/* GradientLineChart */}
            <GradientLineChart />
        </div>

    )
}

export default TeacherGraph