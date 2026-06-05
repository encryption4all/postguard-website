import { describe, it, expect } from 'vitest'
import { verifiedAttributesFor } from './verifiedAttributes'
import type { FriendlySender } from '@e4a/pg-js'

const sender = (attrs: { type: string; value?: string }[]): FriendlySender => ({
    email: attrs.find((a) => a.type.includes('email'))?.value ?? null,
    attributes: attrs,
    raw: {
        public: {
            con: attrs
                .filter((a) => a.type.includes('email'))
                .map((a) => ({ t: a.type, v: a.value })),
        },
        private: {
            con: attrs
                .filter((a) => !a.type.includes('email'))
                .map((a) => ({ t: a.type, v: a.value })),
        },
    },
})

describe('verifiedAttributesFor', () => {
    it('returns an empty list when sender is null or undefined', () => {
        expect(verifiedAttributesFor(null)).toEqual([])
        expect(verifiedAttributesFor(undefined)).toEqual([])
    })

    it('returns each non-email attribute with its i18n label key and value', () => {
        const result = verifiedAttributesFor(
            sender([
                { type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' },
                {
                    type: 'pbdf.gemeente.personalData.fullname',
                    value: 'R.A. Hensen',
                },
                {
                    type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                    value: '+31630222348',
                },
                {
                    type: 'pbdf.gemeente.personalData.dateofbirth',
                    value: '27-05-1996',
                },
            ])
        )
        expect(result).toEqual([
            {
                type: 'pbdf.gemeente.personalData.fullname',
                labelKey:
                    'filesharing.attributes.pbdf.gemeente.personalData.fullname',
                value: 'R.A. Hensen',
            },
            {
                type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                labelKey:
                    'filesharing.attributes.pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                value: '+31630222348',
            },
            {
                type: 'pbdf.gemeente.personalData.dateofbirth',
                labelKey:
                    'filesharing.attributes.pbdf.gemeente.personalData.dateofbirth',
                value: '27-05-1996',
            },
        ])
    })

    it('drops attributes whose value is missing or empty', () => {
        const result = verifiedAttributesFor(
            sender([
                { type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' },
                {
                    type: 'pbdf.gemeente.personalData.fullname',
                    value: 'R.A. Hensen',
                },
                {
                    type: 'pbdf.sidn-pbdf.mobilenumber.mobilenumber',
                    value: undefined,
                },
            ])
        )
        expect(result.map((r) => r.type)).toEqual([
            'pbdf.gemeente.personalData.fullname',
        ])
    })

    it('returns an empty list when the sender only disclosed email', () => {
        const result = verifiedAttributesFor(
            sender([{ type: 'pbdf.sidn-pbdf.email.email', value: 'a@b.com' }])
        )
        expect(result).toEqual([])
    })
})
