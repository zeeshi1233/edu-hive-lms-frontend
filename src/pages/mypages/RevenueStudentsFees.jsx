import RevenueStates from "../../components/mycomponents/admin/RevenueStates";
import RevenueTable from "../../components/mycomponents/admin/RevenueTable";


const RevenueStudentsFees = () => {
 


  return (
    <div >
      {/* Heading */}
      <h4  className="mb-10">
         Revenue
      </h4>

      {/* Stats Cards */}
   <RevenueStates />
<div className="mt-20">

      <RevenueTable />
</div>
      {/* Table */}
    </div>
  );
};


export default RevenueStudentsFees;
