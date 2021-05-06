import React, { useState } from 'react';
import differenceInDays from 'date-fns/difference_in_days';
import { logDev } from '../../helpers/logDev';
import { fetchPostJsonWithToken } from '../../helpers/fetchUtils';
import * as Texts from '../Texts';
import * as Constants from '../Constants';
import FormWithLoader from '../reusable/FormWithLoader';
import FormText from '../reusable/FormText';
import FormCheckBox from '../reusable/FormCheckBox';
import FormTextArea from '../reusable/FormTextArea';
import { useStateEx } from '../../helpers/reactUtils';
import FormSelect from '../reusable/FormSelect';
import PageWithLoader from '../reusable/PageWithLoader';
import { format } from 'date-fns';
import { parseDate } from '../../helpers/helpers';
import { A } from '../reusable/Navigate';

const EditFindBuddies = (props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearMsg = () => {
    setError('');
    setSuccess('');
  }

  const findBuddies = props.userData && props.userData.userDetails ? props.userData.userDetails.findBuddies : null;

  const isDuklaDevin = findBuddies ? (findBuddies.start_miesto == 'Dukla' || 
    findBuddies.start_miesto == 'Devín') : false;

  const [enabled, setEnabled] = useStateEx(findBuddies ? findBuddies.enabled : false, clearMsg);
  const [text, setText] = useStateEx(findBuddies ? findBuddies.text : '', clearMsg);
  const [start, setStart] = useStateEx(findBuddies && findBuddies.start_miesto ? 
    (isDuklaDevin ? findBuddies.start_miesto : 'oth') : 'Dukla', clearMsg);
  const [startOther, setStartOther] = useStateEx(findBuddies && !isDuklaDevin ? findBuddies.start_miesto : '', clearMsg);
  const [startDate, setStartDate] = useStateEx(findBuddies ? findBuddies.start_date : '', clearMsg);

  const save = () => {
    if (findBuddies && (
      enabled === findBuddies.enabled &&
      text === findBuddies.text &&
      (start === findBuddies.start_miesto ||
        startOther === findBuddies.start_miesto) &&
      startDate === findBuddies.start_date)
    ) {
      setError('Nič si nezmenil');
      return;
    }

    if (!text || text.trim().length === 0) {
      setError('Zabudol si na ďalšie informácie!');
      return;
    }

    if (start === 'oth' &&
      (!startOther || startOther.trim().length === 0)
    ) {
      setError('Zabudol si na alternatívny začiatok, kedže nevyrážaš ani z Dukly ani z Devína!');
      return;
    }

    if (!startDate || startDate.trim().length === 0) {
      setError('Zabudol si na približné dátum začiatku cesty!');
      return;
    }

    const sStartDate = parseDate(startDate);
    logDev(sStartDate);
    if (differenceInDays(sStartDate, new Date()) < 0) {
      logDev(differenceInDays(sStartDate, new Date()));
      
      setError('Začiatok cesty nesmie byť v minulosti. Vyber iný dátum!');
      return;
    }

    setLoading(true);
    clearMsg();

    const data = {
      enabled,
      text,
      start_date: format(sStartDate, 'YYYY-MM-DD'),
      uid: props.userData.userDetails.uid,
      start_miesto: start === 'oth' ? startOther : start,
    };

    fetchPostJsonWithToken(props.userData.user, '/api/traveller/updateFindBuddies', data)
    .then(userDetails => {
      if (userDetails.error) {
        throw userDetails.error;
      }
      
      props.userData.updateUserDetails(userDetails);
      setSuccess('Nastavenie hľadanie parťákov sme úspešne zmenili');
    })
    .catch(e => {
      console.error('FindBuddies error', e);

      setError(Texts.GenericError);
    })
    .finally(() => setLoading(false));
  }

  return (
    <PageWithLoader pageId="EditFindBuddies" pageTitle={`Hľadám parťákov${Constants.WebTitleSuffix}`}>
      <FormWithLoader
        loading={loading} error={error} success={success}
        submitText={"Uložiť zmeny"} onSubmit={save}>

        <h2>Hľadám parťákov</h2>
        <p className="form">
          Tvoj inzerát bude zverejnený na stránke <A href="/pred/hladampartakov">Hľadám parťákov</A> len 
          pre prihlásených užívateľov. 
          Prípadní záujemcovia ťa budú môcť kontaktovať cez email, cez ktorý si zaregistrovaný. 
        </p>

        <FormCheckBox itemClassName="form-checkbox" valueName="enabled" valueLabel="Zverejniť môj inzerát" value={[enabled, setEnabled]}/>

        <FormText valueName="startDate" valueLabel="Kedy približne plánuješ vyráziť?" value={[startDate, setStartDate]}
          inputAttrs={{ type: "date" }} itemClassName="form"/>

        <FormSelect valueName="start" valueLabel="Kde chceš štartovať?" value={[start, setStart]} itemClassName="form"
          options={[{ value: "Dukla", label: "Dukla" }, { value: "Devín", label: "Devín" },
            { value: "oth", label: "Inde" }]} 
          labelChildren={start === 'oth' && <FormText valueName="startOther" valueLabel="" value={[startOther, setStartOther]} inputAttrs={{ placeholder: "Kde?" }} itemClassName="form"/>}/>

        <FormTextArea valueName="text" valueLabel="Ďalšie informácie (tvoj plán, o tebe, kto sa môže pridať, ...)" value={[text, setText]} itemClassName="form"/>
      </FormWithLoader>
    </PageWithLoader>
  );
}

export default EditFindBuddies;
