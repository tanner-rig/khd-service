import _ from "lodash";

const appointment = {
  appointmentId: "",
  clientId: "",
  amountPaid: "",
  apptStatus: "",
  date: "",
  discountAmount: "",
  discountType: "",
  duration: "",
  followUpDate: "",
  followUpTime: "",
  location: "",
  milesDriven: "",
  notes: "",
  productUsed: "",
  retailItemsAmount: "",
  retailItemsSold: "",
  service: "",
  time: "",
  tip: "",
  createdAt: "",
  updatedAt: "",
};

export function getAppointmentKeys() {
  return Object.keys(appointment);
}

export function getAppointment(data) {
  const appointmentKeys = getAppointmentKeys();
  const prunedData = _.cloneDeep(data);

  _.forIn(data, (value, key) => {
    // check if key exists on appointment object
    const index = _.indexOf(appointmentKeys, key);

    if (index < 0) {
      // It doesn't exist, don't allow it to be added to db
      delete prunedData[key];
    } else if (!value) {
      // No value, delete it
      delete prunedData[key];
    }
  });

  return prunedData;
}
