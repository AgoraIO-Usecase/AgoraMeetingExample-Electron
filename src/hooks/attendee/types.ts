export declare type AttendeeInfo = {
  id: number;
  name: string;
};

export class AttendeeManager {
  trace = () => {
    console.info('I am attendee manager.');
  };
}
