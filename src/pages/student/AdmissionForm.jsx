import { useLocation } from "react-router-dom";
import MultiStepFormmm from "../../components/AmissionFormComponents/MultiStepFormmm";
const AdmissionForm = () => {  
  const location = useLocation()
  const userId = location.state?.userId
  // console.log("location freom MultiStepFormmm ",location)

return (
  <div className="mainpro">
    <div className="container">   
      <MultiStepFormmm userId={userId} /> 
    </div>
  </div>

  );
};

export default AdmissionForm;


