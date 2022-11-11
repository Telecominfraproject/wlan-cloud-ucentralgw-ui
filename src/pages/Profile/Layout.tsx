import * as React from 'react';
import Masonry from 'react-masonry-css';
import ApiKeysCard from './ApiKeys';
import GeneralInformationProfile from './GeneralInformation';
import MultiFactorAuthProfile from './MultiFactorAuth';
import ProfileNotes from './Notes';
import SummaryInformationProfile from './Summary';

const ProfileLayout = () => (
  <Masonry
    breakpointCols={{
      default: 3,
      1800: 2,
      1200: 1,
    }}
    className="my-masonry-grid"
    columnClassName="my-masonry-grid_column"
  >
    <SummaryInformationProfile />
    <MultiFactorAuthProfile />
    <GeneralInformationProfile />
    <ProfileNotes />
    <ApiKeysCard />
  </Masonry>
);

export default ProfileLayout;
