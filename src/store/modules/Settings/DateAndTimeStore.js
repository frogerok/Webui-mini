import api from '@/store/api';

const DateTimeStore = {
  namespaced: true,
  state: {
    ntpServers: [],
    isNtpProtocolEnabled: null,
  },
  getters: {
    ntpServers: (state) => state.ntpServers,
    isNtpProtocolEnabled: (state) => state.isNtpProtocolEnabled,
  },
  mutations: {
    setNtpServers: (state, ntpServers) => (state.ntpServers = ntpServers),
    setIsNtpProtocolEnabled: (state, isNtpProtocolEnabled) =>
      (state.isNtpProtocolEnabled = isNtpProtocolEnabled),
  },
  actions: {
    async getNtpData({ commit }) {
      return await api
        .get(`${await this.dispatch('global/getBmcPath')}/NetworkProtocol`)
        .then((response) => {
          const ntpServers = response.data.NTP.NTPServers;
          const isNtpProtocolEnabled = response.data.NTP.ProtocolEnabled;
          commit('setNtpServers', ntpServers);
          commit('setIsNtpProtocolEnabled', isNtpProtocolEnabled);
        })
        .catch((error) => {
          console.log(error);
        });
    },
    async updateDateTime({ state }, dateTimeForm) {
      const ntpData = {
        NTP: {
          ProtocolEnabled: dateTimeForm.ntpProtocolEnabled,
        },
      };
      if (dateTimeForm.ntpProtocolEnabled) {
        ntpData.NTP.NTPServers = dateTimeForm.ntpServersArray;
      }
      return await api
        .patch(
          `${await this.dispatch('global/getBmcPath')}/NetworkProtocol`,
          ntpData,
        )
        .then(async () => {
          if (!dateTimeForm.ntpProtocolEnabled) {
            const dateTimeData = {
              DateTime: dateTimeForm.updatedDateTime,
            };
            const timeoutVal = state.isNtpProtocolEnabled ? 20000 : 0;
            return await new Promise((resolve, reject) => {
              setTimeout(async () => {
                return api
                  .patch(
                    `${await this.dispatch('global/getBmcPath')}`,
                    dateTimeData,
                  )
                  .then(() => resolve())
                  .catch(() => reject());
              }, timeoutVal);
            });
          }
        })
        .then(() => {
          return 'pageDateTime.toast.successSaveDateTime';
        })
        .catch((error) => {
          console.log(error);
          throw new Error('pageDateTime.toast.errorSaveDateTime');
        });
    },
  },
};

export default DateTimeStore;
